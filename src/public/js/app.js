const socket = io();

const $call = document.getElementById("call");
const $myFace = document.getElementById("myFace");
const $muteBtn = document.getElementById("mute");
const $cameraBtn = document.getElementById("camera");
const $camerasSelect = document.getElementById("cameras");
$call.hidden = true;

let myStream, roomName, myPeerConncetion, myDataChannel;
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
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );
    console.log(myStream);
    $myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

const handleMuteClick = () => {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    $muteBtn.textContent = "Unmute";
    muted = true;
  } else {
    $muteBtn.textContent = "Mute";
    muted = false;
  }
};
const handleCameraClick = () => {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!cameraOff) {
    $cameraBtn.textContent = "Turn Camera OFF";
    cameraOff = true;
  } else {
    $cameraBtn.textContent = "Turn Camera ON";
    cameraOff = false;
  }
};

const handleCamerChange = async () => {
  await getMedia($camerasSelect.value);
  if (myPeerConncetion) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConncetion
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
};

$muteBtn.addEventListener("click", handleMuteClick);
$cameraBtn.addEventListener("click", handleCameraClick);
$camerasSelect.addEventListener("input", handleCamerChange);

// Welcome Form (join a room)
const $welcome = document.getElementById("welcome");
const $welcomeForm = $welcome.querySelector("form");

async function initCall() {
  $welcome.hidden = true;
  $call.hidden = false;
  await getMedia();
  makeConnection();
}

const handleWelcomeSubmit = async (e) => {
  e.preventDefault();
  const input = $welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
};

$welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socekt Code
socket.on("welcome", async () => {
  console.log("someone joined");
  myDataChannel = myPeerConncetion.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => {
    console.log(event);
    console.log("made data channel");
  });
  const offer = await myPeerConncetion.createOffer();
  myPeerConncetion.setLocalDescription(offer);
  console.log("sent the Offer");
  socket.emit("offer", roomName, offer);
});

socket.on("offer", async (offer) => {
  console.log("received the Offer");
  myPeerConncetion.addEventListener("datachannel", (event) => {
    console.log(event);
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", console.log);
  });
  myPeerConncetion.setRemoteDescription(offer);
  const answer = await myPeerConncetion.createAnswer();
  myPeerConncetion.setLocalDescription(answer);
  socket.emit("answer", roomName, answer);
  console.log("sent the Answer");
});

socket.on("answer", (answer) => {
  console.log("received the Answer");
  myPeerConncetion.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConncetion.addIceCandidate(ice);
});

// RTC Code
function makeConnection() {
  myPeerConncetion = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConncetion.addEventListener("icecandidate", handleIce);
  myPeerConncetion.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConncetion.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("send ice candidate");
  socket.emit("ice", roomName, data.candidate);
  console.log(data);
}

function handleAddStream(data) {
  const $peersFace = document.getElementById("peersFace");
  $peersFace.srcObject = data.stream;
  console.log("got an evnet from my peer");
  console.log(data);
  console.log("peer's stream", data.stream);
  console.log("my stream", myStream);
}
