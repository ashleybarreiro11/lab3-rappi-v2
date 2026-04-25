import { Request, Response } from "express";
import Boom from "@hapi/boom";

import { OrderService } from "./order.service";
import { StoreService } from "../stores/store.service";
import {
  AuthenticatedRequest,
  getUserFromRequest,
} from "../../middlewares/authMiddleware";

export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly storeService: StoreService,
  ) {}

  public createOrder = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const order = await this.orderService.createOrder({
      user_id: user.id,
      store_id: req.body.store_id,
      items: req.body.items,
      delivery_latitude: req.body.delivery_latitude,
      delivery_longitude: req.body.delivery_longitude,
    });
    return res.status(201).json(order);
  };

  public getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const orders = await this.orderService.getOrdersByUserId(user.id);
    return res.json(orders);
  };

  public getAvailableOrders = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const user = getUserFromRequest(req);
    const orders = await this.orderService.getAvailableOrders(user.id);
    return res.json(orders);
  };

  public acceptOrder = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const orderId = String(req.params.id);
    const order = await this.orderService.acceptOrder(orderId, user.id);
    return res.json(order);
  };

  public rejectOrder = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const orderId = String(req.params.id);
    await this.orderService.rejectOrder(orderId, user.id);
    return res.json({ message: "Order rejected successfully" });
  };

  public getMyDeliveries = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const orders = await this.orderService.getOrdersByDeliveryId(user.id);
    return res.json(orders);
  };

  public getStoreOrders = async (req: AuthenticatedRequest, res: Response) => {
    const user = getUserFromRequest(req);
    const store = await this.storeService.getStoreByUserId(user.id);
    if (!store) throw Boom.notFound("Store not found for this user");
    const orders = await this.orderService.getOrdersByStoreId(store.id);
    return res.json(orders);
  };

  public getOrderById = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const order = await this.orderService.getOrderById(id);
    if (!order) throw Boom.notFound("Order not found");
    return res.json(order);
  };
}
