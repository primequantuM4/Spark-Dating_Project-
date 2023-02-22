const express = require("express");
const { handleNewWebSocket } = require("./back-end/chatting/ws-connection");

const app = express();
const http = require("http");
const WebSocket = require("ws");

const { frontEndRouter } = require("./front-end/front-end-router");
const { backEndRouter } = require("./back-end/back-end-router");
// const { handleNewWebSocket } = require("./back-end/chatting/ws-connection");

app.use("/", frontEndRouter);
app.use("/api", backEndRouter);

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });
webSocketServer.on("connection", handleNewWebSocket);

server.listen(3000, () => console.log("listen 3000"));
console.log("go to home.html");
