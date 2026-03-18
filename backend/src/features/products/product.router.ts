import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRole } from "../auth/auth.types";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { StoreService } from "../stores/store.service";

const router = Router();

const productService = new ProductService();
const storeService = new StoreService();
const productController = new ProductController(productService, storeService);

router.get("/store/:storeId", productController.getProductsByStore);
router.get("/:id", productController.getProductById);
router.post(
  "/",
  authMiddleware([UserRole.STORE]),
  productController.createProduct,
);

export { router };
