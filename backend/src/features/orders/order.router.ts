import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../auth/auth.types";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { StoreService } from "../stores/store.service";
import { DeliveryLocationController } from "./delivery-location.controller";

const router = Router();

const orderService = new OrderService();
const storeService = new StoreService();
const orderController = new OrderController(orderService, storeService);
const deliveryLocationController = new DeliveryLocationController(orderService);

router.post(
  "/",
  authMiddleware([UserRole.CONSUMER]),
  orderController.createOrder,
);
router.get(
  "/my-orders",
  authMiddleware([UserRole.CONSUMER]),
  orderController.getMyOrders,
);
router.get(
  "/available/list",
  authMiddleware([UserRole.DELIVERY]),
  orderController.getAvailableOrders,
);
router.patch(
  "/:id/reject",
  authMiddleware([UserRole.DELIVERY]),
  orderController.rejectOrder,
);
router.patch(
  "/:id/accept",
  authMiddleware([UserRole.DELIVERY]),
  orderController.acceptOrder,
);
router.get(
  "/my-deliveries/list",
  authMiddleware([UserRole.DELIVERY]),
  orderController.getMyDeliveries,
);
router.get(
  "/store/list",
  authMiddleware([UserRole.STORE]),
  orderController.getStoreOrders,
);


router.put(
  "/:id/location",
  authMiddleware([UserRole.DELIVERY]),
  deliveryLocationController.updateLocation,
);
router.get("/:id/location", deliveryLocationController.getLocation);
router.patch(
  "/:id/deliver",
  authMiddleware([UserRole.DELIVERY]),
  deliveryLocationController.markAsDelivered,
);
router.get("/:id/store-location", deliveryLocationController.getStoreLocation);

router.get("/:id", orderController.getOrderById);

export { router };
