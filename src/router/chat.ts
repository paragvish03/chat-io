import Ably from "ably";
import { Request, Response, Router } from "express";
import { verifyToken } from ".";
import history from "../model/history";

const chatRouter = Router();
const ablyClient = new Ably.Realtime(
  "m_Wxmw.8Rrd9g:CQMft-_sxoTwLDkfJLgUr0kCHEm_aeTewhUDbWVmu4k"
);
const channel = ablyClient.channels.get("chat-channel");

chatRouter.post(
  "/send-message",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { message } = req.body;
      const user = req.user;
      channel.publish("chat message", { message, userName: user.userName });
      await history.create({ from: user.id, message });
      return res.status(200).send("Message sent");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
);

chatRouter.get(
  "/chat-history",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const result = await history
        .find()
        .sort({ timestamp: 1 })
        .populate("from");
      channel.publish("load old messages", result);
      channel.publish("user joined", req.user.userName);
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "something went wrong" });
    }
  }
);

channel.subscribe("message", (msg) => {
    console.log("Received message:", msg.data);
  });
export default chatRouter;
