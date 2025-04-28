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

      // Add test emission for debugging
      setTimeout(() => {
        // console.log(`🧪 Testing emit to socket ${socket.id}`);
        socket.emit("test", { message: "Test message" });
      }, 2000);

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

    // Add logging when messages are emitted
    const originalEmit = io.emit;
    io.emit = function() {
      const event = arguments[0];
      const data = arguments[1];
      console.log(`📣 SOCKET EMISSION - Event: ${event}, Data:`, data);
      return originalEmit.apply(this, arguments);
    };

    return io;
  },
};
