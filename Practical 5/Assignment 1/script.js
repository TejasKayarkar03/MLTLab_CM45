const video=document.getElementById("video");
const object=document.getElementById("object");

let model;

async function setupCamera(){

const stream=await navigator.mediaDevices.getUserMedia({video:true});
video.srcObject=stream;

}

async function loadModel(){

model=await mobilenet.load();

detect();

}

async function detect(){

const prediction=await model.classify(video);

object.innerText=prediction[0].className;

setTimeout(detect,500);

}

setupCamera();

video.addEventListener("loadeddata",loadModel);