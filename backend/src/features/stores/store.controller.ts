import { Request, Response } from "express";
import Boom from "@hapi/boom";
import { StoreService } from "./store.service";
import {
  AuthenticatedRequest,
  getUserFromRequest,
} from "../../middlewares/authMiddleware";

export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  public getStores = async (_req: Request, res: Response) => {
    const stores = await this.storeService.getStores();
    return res.json(stores);
  };

  public getMyStore = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const store = await this.storeService.getStoreByUserId(user.id);
    if (!store) throw Boom.notFound("Store not found for this user");
    return res.json(store);
  };

  public createStore = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const store = await this.storeService.createStore({
      user_id: user.id,
      name: req.body.name,
    });
    return res.status(201).json(store);
  };

  public updateMyStoreStatus = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const user = getUserFromRequest(req);
    const myStore = await this.storeService.getStoreByUserId(user.id);
    if (!myStore) throw Boom.notFound("Store not found for this user");
    const updatedStore = await this.storeService.updateStoreStatus(
      myStore.id,
      req.body.is_open,
    );
    return res.json(updatedStore);
  };
}
