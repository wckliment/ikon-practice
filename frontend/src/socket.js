import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ['websocket'],
  autoConnect: false,
});

export const connectSocket = (token) => {
  console.log("🔌 Attempting to connect socket with token");
  socket.auth = { token };
  socket.connect();

  // Log socket ID when connected
  socket.on("connect", () => {
    console.log("🔌 Socket connected with ID:", socket.id);
  });
};
