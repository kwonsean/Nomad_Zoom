const $msgList = document.querySelector("ul");
const $nickNameForm = document.querySelector("#nickName");
const $msgForm = document.querySelector("#msg");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMsg(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
  console.log("Connected to server!");
});

// 서버에서 보낸 메시지 확인
socket.addEventListener("message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg.data;
  $msgList.appendChild(li);
  console.log("New msg : " + msg.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server...");
});

// setTimeout(() => {
//   socket.send("Hello Sever! It's browser~");
// }, 5000);

const handleSubmit = (e) => {
  e.preventDefault();
  const input = $msgForm.querySelector("input");
  socket.send(makeMsg("newMsg", input.value));
  input.value = "";
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const input = $nickNameForm.querySelector("input");
  socket.send(makeMsg("nickName", input.value));
  input.value = "";
};

$msgForm.addEventListener("submit", handleSubmit);
$nickNameForm.addEventListener("submit", handleNickSubmit);
