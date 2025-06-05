const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);

// 1️⃣ Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Next.js frontend çalıştığı port
    methods: ["GET", "POST"],
  },
});

// 2️⃣ PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/", // isteğe bağlı
});
app.use("/peerjs", peerServer);

// 3️⃣ Socket bağlantısı
io.on("connection", (socket) => {
  console.log("🟢 Yeni kullanıcı bağlandı");

  // Kullanıcı bir odaya katılmak istediğinde
  socket.on("join-room", ({ roomId, peerId }) => {
    console.log(`👤 Kullanıcı ${peerId}, oda: ${roomId}`);
    socket.join(roomId);

    // Odadaki diğer kullanıcılara bildir
    socket.to(roomId).emit("user-connected", peerId);
  });

  // Bağlantı kesildiğinde
  socket.on("disconnect", () => {
    console.log("🔴 Kullanıcı bağlantısı koptu");
  });
});

// 4️⃣ Sunucuyu başlat
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Socket + Peer server hazır: http://localhost:${PORT}`);
});
