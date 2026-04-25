import { Router } from "express";
import {
  authenticateUserController,
  createUserController,
  refreshSessionController,
} from "./auth.controller";

export const router = Router();

router.post("/login", authenticateUserController);
router.post("/register", createUserController);
router.post("/refresh", refreshSessionController);
