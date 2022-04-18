const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to server!");
});

// 서버에서 보낸 메시지 확인
socket.addEventListener("message", (msg) => {
  console.log("msg : " + msg.data + " from server");
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server...");
});

setTimeout(() => {
  socket.send("Hello Sever! It's browser~");
}, 5000);
