/**
 * faceDetection.js
 * Encapsulates the Machine Learning logic. Includes model loading, 
 * stream inference execution, and UI overlay rendering using face-api.js.
 */

const FaceAI = {
    // Model CDN path for seamless startup without local bin files
    MODEL_URL: 'https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights/',
    
    // Emotion to Emoji mapping for modern UI aesthetics
    emotionEmojiMap: {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        surprised: '😲',
        neutral: '😐',
        fearful: '😨',
        disgusted: '🤢'
    },

    // UI elements managed specifically for ML feedback
    ui: {
        canvas: document.getElementById('overlay-canvas'),
        displaySize: { width: 0, height: 0 },
        emojiIcon: document.getElementById('current-emoji'),
        emotionLabel: document.getElementById('current-emotion-label'),
        emotionScore: document.getElementById('current-emotion-score')
    },

    // Variables for animation loop
    animationFrameId: null,
    videoElement: null,
    isDetecting: false,

    init: async function(videoEl) {
        this.videoElement = videoEl;
        
        try {
            // Load the minimal necessary models for face detection & emotions
            // TinyFaceDetector is optimal for real-time webcam bounding boxes
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(this.MODEL_URL)
            ]);
            return true;
        } catch (error) {
            console.error("Failed to load Face-API Models:", error);
            return false;
        }
    },

    startDetection: function() {
        if(this.isDetecting) return;
        this.isDetecting = true;
        
        // Sync canvas and video dimensions internally for face-api
        // We handle exact sizing via DOM, but API needs resolution context
        this.ui.displaySize = {
            width: this.videoElement.videoWidth,
            height: this.videoElement.videoHeight
        };
        
        this.ui.canvas.width = this.ui.displaySize.width;
        this.ui.canvas.height = this.ui.displaySize.height;

        faceapi.matchDimensions(this.ui.canvas, this.ui.displaySize);

        this.processFrame();
    },

    stopDetection: function() {
        this.isDetecting = false;
        if(this.animationFrameId) {
            clearTimeout(this.animationFrameId);
        }
        
        // Clear canvas drawings
        const ctx = this.ui.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
        
        // Reset display
        this.ui.emojiIcon.innerText = '🤖';
        this.ui.emotionLabel.innerText = 'Camera Paused';
        this.ui.emotionScore.innerText = '--';
    },

    processFrame: async function() {
        if (!this.isDetecting || this.videoElement.paused || this.videoElement.ended) {
            return;
        }

        // Run ML inference
        // Predict faces bounding box using TinyFaceDetector, and expressions for each
        const detections = await faceapi.detectAllFaces(
            this.videoElement, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        ).withFaceExpressions();

        // 1. Resize bounding boxes mathematically to our video layout size
        const resizedDetections = faceapi.resizeResults(detections, this.ui.displaySize);
        
        // 2. Clear previous frame
        const ctx = this.ui.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

        // 3. Custom Drawing Logic (Premium appearance)
        if(resizedDetections.length > 0) {
            
            // For SaaS Dashboard, we process the MOST prominent face's emotion
            // (Assuming single focused user for UX testing scenario)
            let topDetection = resizedDetections[0];
            
            // Find highest scored emotion for this person
            let maxEmotion = "neutral";
            let maxScore = 0;
            
            for (const [emotion, score] of Object.entries(topDetection.expressions)) {
                if (score > maxScore) {
                    maxScore = score;
                    maxEmotion = emotion;
                }
            }

            // Update UI Sidebar Live Stream Box
            this.ui.emojiIcon.innerText = this.emotionEmojiMap[maxEmotion] || '🤖';
            this.ui.emotionLabel.innerText = this.capitalizeFirstLetter(maxEmotion);
            this.ui.emotionScore.innerText = `Confidence: ${(maxScore * 100).toFixed(1)}%`;
            
            // Push data to Chart.js dashboard
            Dashboard.update(maxEmotion);
            
            // Draw visually appealing bounding boxes locally around all detected
            resizedDetections.forEach(detection => {
                const box = detection.detection.box;
                
                // Mathematically mirror the X coordinate to match CSS-flipped video, protecting text readability
                const mirroredX = this.ui.canvas.width - box.x - box.width;
                
                // Draw Box
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#818cf8'; // Brand primary
                ctx.rect(mirroredX, box.y, box.width, box.height);
                ctx.stroke();

                // Get expression to print above box
                const expressions = detection.expressions;
                const topExp = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
                
                // Draw Label Background
                ctx.fillStyle = '#818cf8';
                ctx.fillRect(mirroredX, box.y - 30, topExp.length * 12 + 40, 30);
                
                // Draw Label Text
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Inter';
                // Using capitalizeFirstLetter for clean presentation
                ctx.fillText(`${this.emotionEmojiMap[topExp]} ${this.capitalizeFirstLetter(topExp)}`, mirroredX + 8, box.y - 10);
            });
        }

        // Extremely fast recursive loop optimized over requestAnimationFrame constraints
        // We use setTimeout 50ms here (20fps) to keep the UI from lagging while executing heavy tensors.
        this.animationFrameId = setTimeout(() => this.processFrame(), 50);
    },
    
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};