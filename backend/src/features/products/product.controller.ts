import { Request, Response } from "express";
import Boom from "@hapi/boom";

import { ProductService } from "./product.service";
import { StoreService } from "../stores/store.service";
import {
  AuthenticatedRequest,
  getUserFromRequest,
} from "../../middlewares/authMiddleware";

export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly storeService: StoreService,
  ) {}

  public getProductsByStore = async (req: Request, res: Response) => {
    const storeId = String(req.params.storeId);

    const products = await this.productService.getProductsByStoreId(storeId);

    return res.json(products);
  };

  public getProductById = async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const product = await this.productService.getProductById(id);

    if (!product) {
      throw Boom.notFound("Product not found");
    }

    return res.json(product);
  };

  public createProduct = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);

    const store = await this.storeService.getStoreByUserId(user.id);

    if (!store) {
      throw Boom.notFound("Store not found for this user");
    }

    const product = await this.productService.createProduct({
      store_id: store.id,
      name: req.body.name,
      price: req.body.price,
    });

    return res.status(201).json(product);
  };
}
