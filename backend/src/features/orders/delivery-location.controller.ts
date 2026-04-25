import { Response } from "express";
import Boom from "@hapi/boom";

import { OrderService } from "./order.service";
import { OrderStatus } from "./order.types";
import {
  AuthenticatedRequest,
  getUserFromRequest,
} from "../../middlewares/authMiddleware";
import { pool } from "../../config/database";

export class DeliveryLocationController {
  constructor(private readonly orderService: OrderService) {}

  public updateLocation = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const user = getUserFromRequest(req);
    const orderId = String(req.params.id);
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      throw Boom.badRequest("latitude and longitude are required");
    }

    const order = await this.orderService.getOrderOwnership(orderId);
    if (!order) throw Boom.notFound("Order not found");
    if (order.delivery_id !== user.id)
      throw Boom.forbidden("This order is not assigned to you");

    const updateQuery = `
      UPDATE orders
      SET delivery_position = ST_SetSRID(ST_MakePoint($1, $2), 4326)
      WHERE id = $3
      RETURNING id as order_id, delivery_id, ST_Y(delivery_position::geometry) as latitude, ST_X(delivery_position::geometry) as longitude
    `;

    const result = await pool.query(updateQuery, [
      longitude,
      latitude,
      orderId,
    ]);

    const distanceQuery = `
      SELECT ST_Distance(delivery_position, destination) as distance,
             ST_DWithin(delivery_position, destination, 5) as is_near
      FROM orders
      WHERE id = $1
    `;
    const distanceResult = await pool.query(distanceQuery, [orderId]);
    const { distance, is_near } = distanceResult.rows[0] || { distance: null, is_near: false };

    return res.json({ ...result.rows[0], distance, isNear: is_near });
  };

  public getLocation = async (req: AuthenticatedRequest, res: Response) => {
    const orderId = String(req.params.id);

    const query = `
      SELECT id as order_id, delivery_id, ST_Y(delivery_position::geometry) as latitude, ST_X(delivery_position::geometry) as longitude 
      FROM orders WHERE id = $1 AND delivery_position IS NOT NULL
    `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
      throw Boom.notFound("Location not found for this order");
    }

    return res.json(result.rows[0]);
  };

  public markAsDelivered = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const user = getUserFromRequest(req);
    const orderId = String(req.params.id);

    const order = await this.orderService.getOrderOwnership(orderId);
    if (!order) throw Boom.notFound("Order not found");
    if (order.delivery_id !== user.id)
      throw Boom.forbidden("This order is not assigned to you");

    const updateQuery = `
      UPDATE orders SET status = '${OrderStatus.DELIVERED}' WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [orderId]);

    return res.json(result.rows[0]);
  };

  public getStoreLocation = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const orderId = String(req.params.id);

    const order = await this.orderService.getOrderById(orderId);
    if (!order) throw Boom.notFound("Order not found");

    const query = `SELECT id, name FROM stores WHERE id = $1`;
    const result = await pool.query(query, [order.store_id]);

    if (result.rows.length === 0) {
      throw Boom.notFound("Store not found");
    }

    return res.json({ ...result.rows[0], latitude: null, longitude: null });
  };
}
