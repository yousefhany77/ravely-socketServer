const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🚀⚡ Socket connected video v2 =>" + socket.id);
  socket.on("join", (room, callback) => {
    socket.join(room);
    callback("joined room =>" + room);
  });
  socket.on("video_event", (user, timeline, eventType, room) => {
    socket.to(room).emit("video_event", user, timeline, eventType);
    console.log("video_event", user, timeline, eventType);
  });
});

io.on("disconnect", () => {
  console.log("😭 Socket disconnected");
});

app.get("/video", (req, res) => {
  const range = req.headers.range;
  if (!range) {
    return res.status(400).send("Requires Range header");
  }
  const videoPath = "./video.mp4";
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

server.listen(3001, () => {
  console.log("🚀⚡ Socket server listening on port 3001");
});
