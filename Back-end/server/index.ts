import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { roomHandler } from "../room/index";
import routes from "../routers";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser'
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
dotenv.config();

const app: Express = express();
app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
const port: number = parseInt(process.env.PORT || "3001", 10);
const host: string = process.env.HOST || "0.0.0.0";

const keyPath = path.resolve(__dirname, '../certs/cert.key');
const certPath = path.resolve(__dirname, '../certs/cert.crt');

const options: https.ServerOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  requestCert: false,
  rejectUnauthorized: false
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],

  },
});

app.use(bodyParser.json());
app.use(cookieParser());
routes(app);

mongoose
  .connect(process.env.MONGO_DB || "")
  .then(() => {
    console.log("Connect DB success");
  })
  .catch((err: Error) => {
    console.error(err);
  });

io.on("connection", (socket: Socket) => {
  console.log("Connected");
  roomHandler(socket);
  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
