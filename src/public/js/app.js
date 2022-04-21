const socket = io();

const $welcome = document.getElementById("welcome");
const $form = $welcome.querySelector("form");
const $room = document.getElementById("room");
const $roomName = $room.querySelector("h3");

$room.hidden = true;

let roomName;

const addMsg = (msg) => {
  const $ul = $room.querySelector("ul");
  const li = document.createElement("li");
  li.textContent = msg;
  $ul.appendChild(li);
};

const handleMsgSubmit = (e) => {
  e.preventDefault();
  const $roomInput = $room.querySelector("input");
  const value = $roomInput.value;
  socket.emit("new_msg", $roomInput.value, roomName, () => {
    addMsg("You : " + value);
  });
  $roomInput.value = "";
};

// 백엔드에서 인수를 받을 수 있다.
const showRoom = () => {
  $welcome.hidden = true;
  $room.hidden = false;
  $roomName.textContent = `Room ${roomName}`;
  const $roomForm = $room.querySelector("form");
  $roomForm.addEventListener("submit", handleMsgSubmit);
};

// emit(이벤트 명, 객체, 콜백)
// 이벤트명을 제외하고는 객체, 문자, 숫자 등 다양한 인자를 많이 보낼 수 있다.
// 하지만 끝날때 실행됬으면 하는 함수는 꼭 마지막에 넣어주어야 한다.
const handleRoomSubmit = (e) => {
  e.preventDefault();
  const $input = $form.querySelector("input");
  socket.emit("enter_room", $input.value, showRoom);
  roomName = $input.value;
  $input.value = "";
};

$form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMsg("Someone Joined!");
});

socket.on("bye", () => {
  addMsg("Someone left!");
});

socket.on("new_msg", addMsg);
