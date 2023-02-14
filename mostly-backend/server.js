const express = require("express");
const app = express();
const http = require("http");
const WebSocket = require("ws");

const frontEndRouter = require("./front-end/router");
const backEndRouter = require("./back-end/router");
const { handleNewWebSocket } = require("./back-end/chatting/ws-connection");

app.use("/api", backEndRouter);
app.use("/", frontEndRouter);

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });
webSocketServer.on("connection", handleNewWebSocket);

server.listen(3000, () => console.log("listen 3000"));
