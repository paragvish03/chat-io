import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { createServer } from "node:http";
import { join } from "node:path";
import authRouter from "./router";
import chatRouter from "./router/chat";
require("../config/db");

const port = 3030;
const app = express();
const server = createServer(app);
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(authRouter);
app.use(chatRouter);
app.use(cors());
app.get("/", (req: Request, res: Response) => {
  return res.sendFile(join(__dirname, "../public/login.html"));
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
