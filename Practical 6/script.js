const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const poseText = document.getElementById("poseName");

let detector;

async function setupCamera(){

const stream = await navigator.mediaDevices.getUserMedia({
video:true
});

video.srcObject = stream;

return new Promise(resolve=>{
video.onloadedmetadata=()=>{
video.play();
resolve(video);
};
});
}

function drawKeypoints(keypoints){

keypoints.forEach(kp=>{

if(kp.score > 0.3){

ctx.beginPath();
ctx.arc(kp.x, kp.y, 6, 0, 2*Math.PI);
ctx.fillStyle = "red";
ctx.fill();

}

});

}

function drawSkeleton(keypoints){

const pairs = [
[5,7],[7,9],
[6,8],[8,10],
[5,6],
[5,11],[6,12],
[11,12],
[11,13],[13,15],
[12,14],[14,16]
];

pairs.forEach(([i,j])=>{

const kp1 = keypoints[i];
const kp2 = keypoints[j];

if(kp1.score>0.3 && kp2.score>0.3){

ctx.beginPath();
ctx.moveTo(kp1.x, kp1.y);
ctx.lineTo(kp2.x, kp2.y);
ctx.strokeStyle="lime";
ctx.lineWidth=3;
ctx.stroke();

}

});

}

function detectPoseType(keypoints){

const leftWrist = keypoints[9];
const rightWrist = keypoints[10];

const leftShoulder = keypoints[5];
const rightShoulder = keypoints[6];

const leftHip = keypoints[11];
const rightHip = keypoints[12];

const leftKnee = keypoints[13];
const rightKnee = keypoints[14];

// Hands Up
if(leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y){
return "Hands Up";
}

// Left Hand Up
if(leftWrist.y < leftShoulder.y){
return "Left Hand Up";
}

// Right Hand Up
if(rightWrist.y < rightShoulder.y){
return "Right Hand Up";
}

// T Pose
if(Math.abs(leftWrist.y - leftShoulder.y) < 40 &&
Math.abs(rightWrist.y - rightShoulder.y) < 40){
return "T Pose";
}

// Squat
if(leftHip.y > leftKnee.y && rightHip.y > rightKnee.y){
return "Squat";
}

// Sitting
if(Math.abs(leftHip.y - leftKnee.y) < 40){
return "Sitting";
}

// Default
return "Standing";

}

async function runPoseDetection(){

await tf.ready();

const model = poseDetection.SupportedModels.MoveNet;

detector = await poseDetection.createDetector(model,{
modelType:poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
});

await setupCamera();

canvas.width = 640;
canvas.height = 480;

async function detect(){

ctx.drawImage(video,0,0,640,480);

const poses = await detector.estimatePoses(video);

if(poses.length > 0){

const keypoints = poses[0].keypoints;

drawKeypoints(keypoints);
drawSkeleton(keypoints);

const poseName = detectPoseType(keypoints);

poseText.innerText = "Pose: " + poseName;

}

requestAnimationFrame(detect);

}

detect();

}

runPoseDetection();