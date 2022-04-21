const socket = io();

const $welcome = document.getElementById("welcome");
const $form = $welcome.querySelector("form");
const $room = document.getElementById("room");
const $roomName = $room.querySelector("h3");
const $roomNickNameForm = document.querySelector("#nickName");
const $leaveRoomBtn = document.querySelector("#leave");

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
  const $roomMsgInput = $room.querySelector("#msg input");
  const value = $roomMsgInput.value;
  socket.emit("new_msg", $roomMsgInput.value, roomName, () => {
    addMsg("You : " + value);
  });
  $roomMsgInput.value = "";
};

const handleNickNameSubmit = (e) => {
  e.preventDefault();
  const $roomNickNameInput = $roomNickNameForm.querySelector("input");
  socket.emit("nickName", $roomNickNameInput.value, roomName);
};

// 백엔드에서 인수를 받을 수 있다.
const showRoom = () => {
  $welcome.hidden = true;
  $room.hidden = false;
  $roomName.textContent = `Room ${roomName}`;
  const $roomMsgForm = $room.querySelector("#msg");

  $roomMsgForm.addEventListener("submit", handleMsgSubmit);
};

const hideRoom = () => {
  $welcome.hidden = false;
  $room.hidden = true;
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

const handleLeaveRoom = () => {
  socket.emit("leave_room", roomName, hideRoom);
};

$form.addEventListener("submit", handleRoomSubmit);
$roomNickNameForm.addEventListener("submit", handleNickNameSubmit);
$leaveRoomBtn.addEventListener("click", handleLeaveRoom);

socket.on("welcome", (newUser, userCount) => {
  $roomName.textContent = `Room ${roomName} (${userCount})`;
  addMsg(`${newUser} Joined!`);
});

socket.on("bye", (leftUser, userCount) => {
  $roomName.textContent = `Room ${roomName} (${userCount})`;
  addMsg(`${leftUser} left...`);
});

socket.on("new_msg", addMsg);

socket.on("room_change", (rooms) => {
  const $roomList = $welcome.querySelector("ul");
  $roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.textContent = room;
    $roomList.append(li);
  });
});
