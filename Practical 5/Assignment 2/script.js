const video=document.getElementById("video");
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

let model;

async function startCamera(){

const stream=await navigator.mediaDevices.getUserMedia({video:true});
video.srcObject=stream;

}

async function loadModel(){

model=await cocoSsd.load();
detect();

}

async function detect(){

canvas.width=video.videoWidth;
canvas.height=video.videoHeight;

const predictions=await model.detect(video);

ctx.clearRect(0,0,canvas.width,canvas.height);

predictions.forEach(p=>{

const [x,y,w,h]=p.bbox;

ctx.strokeStyle="#ff1493";
ctx.lineWidth=3;

ctx.strokeRect(x,y,w,h);

ctx.fillStyle="#ff69b4";
ctx.fillText(p.class,x,y-5);

});

requestAnimationFrame(detect);

}

startCamera();

video.addEventListener("loadeddata",loadModel);