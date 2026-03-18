import { Router } from "express";
import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../auth/auth.types";

const router = Router();

const storeService = new StoreService();
const storeController = new StoreController(storeService);

router.get("/", storeController.getStores);
router.get("/me", authMiddleware([UserRole.STORE]), storeController.getMyStore);
router.post("/", authMiddleware([UserRole.STORE]), storeController.createStore);
router.patch(
  "/me/status",
  authMiddleware([UserRole.STORE]),
  storeController.updateMyStoreStatus,
);

export { router };
