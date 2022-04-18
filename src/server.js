import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("http://localhost:3000", "ws://localhost:3000");

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });
// 3000포트에서 http와 ws 모두 사용 가능

// 연결이 될때마다 소켓을 담는 배열
// 이 소켓에는 각 브라우져의 소캣이 담기게되고 이 배열을 이용하여 다른 브라우저에도 메시지 전달 가능
const sockets = [];

// 아래 코드는 브라우저(클라이언트)에 연결될때 마다 실행
webSocketServer.on("connection", (socket) => {
  sockets.push(socket);
  socket.nickName = "NOBODY";
  console.log("Connected to Browser!");
  socket.on("close", () => console.log("Disconnected to Browser!"));
  socket.on("message", (msg) => {
    const msgDecode = msg.toString("utf8");
    const { type, payload: data } = JSON.parse(msgDecode);
    switch (type) {
      case "newMsg":
        sockets.filter((item) => item !== socket).forEach((aSocket) => aSocket.send(`${socket.nickName} : ${data}`));
        break;
      case "nickName":
        console.log(data);
        socket.nickName = data;
        break;
      default:
        break;
    }
  });
});

server.listen(3000, handleListen);
