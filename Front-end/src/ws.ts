import socketIOClient from "socket.io-client";

//export const WS = "http://192.168.174.192:3001/";
export const WS = "http://localhost:3001/";
export const ws = socketIOClient(WS, { secure: false, rejectUnauthorized: false, transports: ['websocket'], });