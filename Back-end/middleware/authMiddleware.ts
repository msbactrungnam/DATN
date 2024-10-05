import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  id?: string;
  role?: string;
}

// Middleware to check if the user is an admin
const authMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: "ERR",
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "ERR",
      message: "No token provided",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: "ERR",
        message: "Invalid or expired token",
      });
    }
    const payload = decoded as JwtPayload;
    if (payload.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        status: "ERR",
        message: "Not authorized",
      });
    }

  });
};

// Middleware to check if the user is authorized to access a specific resource
const authUserMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;
  const userId = req.params.id;

  if (!authHeader) {
    return res.status(401).json({
      status: "ERR",
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "ERR",
      message: "No token provided",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: "ERR",
        message: "Invalid or expired token",
      });
    }

    const payload = decoded as JwtPayload;
    if (payload.role === "admin" || payload.id === userId) {
      next();
    } else {
      return res.status(403).json({
        status: "ERR",
        message: "Not authorized",
      });
    }
  });
};

export { authMiddleware, authUserMiddleware };
