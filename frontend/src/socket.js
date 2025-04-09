import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ['websocket'],
  autoConnect: false,
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};
