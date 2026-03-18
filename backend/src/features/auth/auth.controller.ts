import { Request, Response } from "express";
import { authenticateUserService, createUserService } from "./auth.service";

export const createUserController = async (req: Request, res: Response) => {
  const user = await createUserService(req.body);
  return res.status(201).json(user);
};

export const authenticateUserController = async (
  req: Request,
  res: Response,
) => {
  const session = await authenticateUserService(req.body);
  return res.status(200).json(session);
};
