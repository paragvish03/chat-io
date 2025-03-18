import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createServer } from "node:http";
import { join } from "node:path";
import { Server } from "socket.io";
import history from "./model/history";
import authRouter from "./router";
require("../config/db");

const port = 3030;
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(authRouter);
app.use(cors());
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public/login.html"));
});

io.on("connection", (socket) => {
  const cookies = socket.handshake.headers.cookie;
  const parsedCookies = cookies?.split("authToken=");
  const token = parsedCookies?.length ? parsedCookies[1] : null;
  if (token) {
    jwt.verify(token, "JWT_SECRET_KEY", async (err, decoded) => {
      if (err) {
        console.error("Authentication failed:", err);
        socket.disconnect();
        return;
      }
      (socket as any).user = decoded;
      const oldMessages = await history
        .find({})
        .sort({ timestamp: 1 })
        .populate("from");

      socket.emit("load old messages", oldMessages);
      socket.emit("user enter", (socket as any).user.userName);
      console.log(
        `User ${(socket as any).user.userName} connected`,
        oldMessages
      );
    });
  } else {
    socket.disconnect();
  }

  socket.on("chat message", async (msg) => {
    if ((socket as any).user) {
      await history.create({ from: (socket as any).user.id, message: msg });
      io.emit("chat message", {
        userName: (socket as any).user.userName,
        message: msg,
      });
    } else {
      socket.emit("chat message", "Please authenticate first");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${(socket as any).user.userName} disconnected`);
  });
  //for edit
  socket.on("edit message", (msgData) => {
    history.findByIdAndUpdate(
      msgData._id,
      { message: msgData.message },
      { new: true }
    );
  });

  //for delete
  socket.on("delete message", (msgData) => {
    history.findByIdAndDelete(msgData._id, (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
      io.emit("message deleted", msgData._id); // Emit to all clients
    });
  });
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
