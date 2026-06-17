import { io } from "socket.io-client";
const url = "ws://localhost:3000";

function getCurrentToken() {
  const token = localStorage.getItem('token');
  return token;
}

export const socket = io(url, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: getCurrentToken() });
  },
});

socket.on("connect", () => {
  console.log("Socket connect");
});

socket.on("disconnect", () => {
  consolo.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error(`Connection failed: ${error.message}`);
});
