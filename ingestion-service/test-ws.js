const WebSocket = require("ws");

const ws = new WebSocket("ws://3.98.144.85:8556");

ws.on("open", function open() {
  console.log("connected");
});

ws.on("error", function error() {
  console.log("failed to connect");
});
