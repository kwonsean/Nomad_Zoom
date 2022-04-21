import express from "express";
import http from "http";
import WebSocket from "ws";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("http://localhost:3000", "ws://localhost:3000");

const httpServer = http.createServer(app);
// const webSocketServer = new WebSocket.Server({ httpServer });
// 3000포트에서 http와 ws 모두 사용 가능
const io = new Server(httpServer);

// socket.io를 사용하여 이벤트 커스텀이 가능하고 객체를 받을수 있다.
// 또한 함수를 받아서 실행시킬 수 있다. (프론트에서 실행됨)
io.on("connection", (socket) => {
  console.log(socket);
  socket.on("enter_room", (roomName, callback) => {
    console.log(roomName);
    callback("HI CLIENT!"); // 프론트에서 실행됨 (백엔드에서 실행되는 것은 보안문제 발생)
  });
});

// ! web socket code
// 연결이 될때마다 소켓을 담는 배열
// 이 소켓에는 각 브라우져의 소캣이 담기게되고 이 배열을 이용하여 다른 브라우저에도 메시지 전달 가능
// const sockets = [];

// // 아래 코드는 브라우저(클라이언트)에 연결될때 마다 실행
// webSocketServer.on("connection", (socket) => {
//   sockets.push(socket);
//   socket.nickName = "NOBODY";
//   console.log("Connected to Browser!");
//   socket.on("close", () => console.log("Disconnected to Browser!"));
//   socket.on("message", (msg) => {
//     const msgDecode = msg.toString("utf8");
//     const { type, payload: data } = JSON.parse(msgDecode);
//     switch (type) {
//       case "newMsg":
//         sockets.filter((item) => item !== socket).forEach((aSocket) => aSocket.send(`${socket.nickName} : ${data}`));
//         break;
//       case "nickName":
//         console.log(data);
//         socket.nickName = data;
//         break;
//       default:
//         break;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
