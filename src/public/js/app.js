const socket = io();

const $myFace = document.getElementById("myFace");
const $muteBtn = document.getElementById("mute");
const $cameraBtn = document.getElementById("camera");
const $camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.textContent = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      $camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstrains : initialConstrains);
    console.log(myStream);
    $myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

getMedia();

handleMuteClick = () => {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    $muteBtn.textContent = "Unmute";
    muted = true;
  } else {
    $muteBtn.textContent = "Mute";
    muted = false;
  }
};
handleCameraClick = () => {
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!cameraOff) {
    $cameraBtn.textContent = "Turn Camera OFF";
    cameraOff = true;
  } else {
    $cameraBtn.textContent = "Turn Camera ON";
    cameraOff = false;
  }
};

handleCamerChange = async () => {
  await getMedia($camerasSelect.value);
};

$muteBtn.addEventListener("click", handleMuteClick);
$cameraBtn.addEventListener("click", handleCameraClick);
$camerasSelect.addEventListener("input", handleCamerChange);
