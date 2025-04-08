let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`⚡ New client connected: ${socket.id}`);

      socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`📦 Socket ${socket.id} joined room: ${room}`);
      });

      socket.on("disconnect", () => {
        console.log(`🔥 Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
