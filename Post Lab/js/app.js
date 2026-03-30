/**
 * app.js
 * Main Orchestrator. Bootstraps the application, mounts WebCam, 
 * links UI buttons to ML backend, and initializes the SaaS Dashboards.
 */

document.addEventListener('DOMContentLoaded', async () => {
    
    // UI Selectors
    const video = document.getElementById('webcam');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const statusBadge = document.getElementById('app-status');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    let stream = null;

    // 1. Initialize Dashboard (Chart.js via dashboard.js)
    Dashboard.init();

    // 2. Pre-Load TensorFlow Models from faceDetection.js
    const modelsLoaded = await FaceAI.init(video);
    
    if(modelsLoaded) {
        statusBadge.innerHTML = 'AI Engine Ready';
        statusBadge.classList.add('ready');
        startBtn.disabled = false;
        
        // Hide loading visual
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
    } else {
        statusBadge.innerHTML = 'Model Load Failed';
        statusBadge.style.color = '#ef4444';
        loadingOverlay.innerHTML = '<p style="color:red;">Error loading core tensor models. Check console.</p>';
    }

    // 3. User Controls setup
    startBtn.addEventListener('click', async () => {
        try {
            // Ask browser for webcam permission safely
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user', 
                    width: { ideal: 640 },
                    height: { ideal: 480 } 
                }, 
                audio: false 
            });
            
            video.srcObject = stream;
            
            // Wait until camera fully mounts and sets its internal dimensions natively
            video.onloadedmetadata = () => {
                // Ensure dimensions are completely settled
                video.width = video.videoWidth;
                video.height = video.videoHeight;
                video.play();
                
                // Toggle UI state
                startBtn.disabled = true;
                stopBtn.disabled = false;
                
                // Dispatch AI
                FaceAI.startDetection();
            };
            
        } catch (error) {
            console.error("Camera access denied or failed:", error);
            alert("Unable to access camera. Please explicitly allow permissions in your browser.");
        }
    });

    stopBtn.addEventListener('click', () => {
        // Halt AI polling
        FaceAI.stopDetection();

        // Kill camera tracks securely
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            stream = null;
        }

        // Toggle UI
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });

});