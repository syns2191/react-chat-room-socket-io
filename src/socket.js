import { io } from "socket.io-client";
import env from "./config/env";

const url = env.SOCKET_URL;

function getCurrentToken() {
  const token = localStorage.getItem("token");
  return token;
}

export const socket = io(url, {
  autoConnect: false,
  transports: ["websocket"],
  auth: (cb) => {
    cb({ token: getCurrentToken() });
  },
});

socket.on("connect", () => {
  console.log("Socket connect");
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error(`Connection failed: ${error.message}`);
});
