const socket = io();

const $welcome = document.getElementById("welcome");
const $form = $welcome.querySelector("form");

// 백엔드에서 인수를 받을 수 있다.
const backEndDone = (msg) => {
  console.log("Back End msg: " + msg);
};

// emit(이벤트 명, 객체, 콜백)
// 이벤트명을 제외하고는 객체, 문자, 숫자 등 다양한 인자를 많이 보낼 수 있다.
// 하지만 끝날때 실행됬으면 하는 함수는 꼭 마지막에 넣어주어야 한다.
const handleRoomSubmit = (e) => {
  e.preventDefault();
  const $input = $form.querySelector("input");
  socket.emit("enter_room", $input.value, backEndDone);
  $input.value = "";
};

$form.addEventListener("submit", handleRoomSubmit);
