import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/user";
import { join } from "path";
import { Type } from "typescript";
import mongoose from "mongoose";

const authRouter = Router();
const SECRET_KEY = "JWT_SECRET_KEY";

authRouter.post("/get-in", async (req, res): Promise<any> => {
  try {
    const { userName, password } = req.body;
    let userDetails = await User.findOne({ userName });
    if (userDetails) {
      const passwordCheck = await User.findOne({ userName, password });
      if (!passwordCheck)
        return res.status(401).json({ message: "Invalid password" });
    }
    if (!userDetails) userDetails = await User.create({ userName, password });

    const token = generateToken(userDetails.userName, userDetails._id);
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 36000000,
    });
    return res.sendFile(join(__dirname, "../../public/index.html"));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something went wrong" });
  }
});

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const token = req.cookies.authToken || req.headers["auth"]; 

  if (!token) {
    return res.status(403).send("No token provided");
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(500).send("Failed to authenticate token");
    }

    req.user = decoded;
    console.log(decoded, "coded");
    next();
  });
};

export const generateToken = (
  userName: string,
  id: mongoose.Types.ObjectId
) => {
  return jwt.sign({ userName, id }, SECRET_KEY, {
    expiresIn: "10h",
  });
};
export default authRouter;
