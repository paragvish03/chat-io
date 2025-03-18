import { Socket } from "socket.io";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any; // Define the 'user' property in Request
    }
  }
  interface Socket {
    user: { 
      username: string; 
      userId: string;
      // You can add other fields that are part of your JWT token here
    };
  }
}
