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

webSocketServer.on("connection", (socket) => {
  console.log("Connected to Browser!");
  socket.on("close", () => console.log("Disconnected to Browser!"));
  socket.on("message", (msg) => console.log(msg.toString("utf8")));
  socket.send("Hello client!");
});

server.listen(3000, handleListen);
