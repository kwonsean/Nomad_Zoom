import express from "express";
import http from "http";
import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () =>
  console.log("http://localhost:3000", "ws://localhost:3000");

const httpServer = http.createServer(app);
// const webSocketServer = new WebSocket.Server({ httpServer });
// 3000포트에서 http와 ws 모두 사용 가능

// admin-ui 추가
const io = new Server(httpServer, {
  cors: {
    origin: ["http://admin.socket.io"],
    credentials: true,
  },
});
instrument(io, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
}

function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  socket.on("offer", (roomName, offer) => {
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (roomName, answer) => {
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("leave_room", (roomName, done) => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickName, countRoom(room) - 1)
    );
    socket.leave(roomName);
    done();
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_msg", (msg, roomName, done) => {
    socket.to(roomName).emit("new_msg", ` ${socket.nickName} : ${msg}`);
    done();
  });

  socket.on("nickName", (nickName) => {
    socket.nickName = nickName;
  });

  // socket이 연결해지 되기 전에 실행
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickName, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
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
