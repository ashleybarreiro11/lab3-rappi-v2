import Boom from "@hapi/boom";
import { supabase } from "../../config/supabase";
import { pool } from "../../config/database";
import { CreateOrderDTO, Order, OrderStatus } from "./order.types";

export class OrderService {
  public async createOrder(order: CreateOrderDTO): Promise<Order> {
    if (!order.store_id) throw Boom.badRequest("store_id is required");
    if (!order.items || order.items.length === 0)
      throw Boom.badRequest("items are required");
    if (order.delivery_latitude == null || order.delivery_longitude == null)
      throw Boom.badRequest("delivery_latitude and delivery_longitude are required");

    const createOrderQuery = `
      INSERT INTO orders (user_id, store_id, status, destination)
      VALUES ($1, $2, '${OrderStatus.PENDING}', ST_SetSRID(ST_MakePoint($4, $3), 4326))
      RETURNING id, user_id, store_id, delivery_id, status, created_at, ST_Y(destination::geometry) as delivery_latitude, ST_X(destination::geometry) as delivery_longitude
    `;

    const result = await pool.query(createOrderQuery, [
      order.user_id,
      order.store_id,
      order.delivery_latitude,
      order.delivery_longitude
    ]);

    const newOrder = result.rows[0];

    for (const item of order.items) {
      if (!item.product_id || !item.quantity) {
        throw Boom.badRequest("Each item must have product_id and quantity");
      }

      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .eq("store_id", order.store_id)
        .single();

      if (!product) {
        throw Boom.badRequest(
          `Product ${item.product_id} does not belong to this store`,
        );
      }

      const { error: itemError } = await supabase.from("items").insert({
        product_id: item.product_id,
        order_id: newOrder.id,
        quantity: item.quantity,
      });

      if (itemError) throw Boom.internal(itemError.message);
    }

    return newOrder;
  }

  public async getOrdersByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, stores(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw Boom.internal(error.message);
    return data || [];
  }

  public async getAvailableOrders(deliveryId: string): Promise<any[]> {
    const { data: rejectedRows } = await supabase
      .from("order_rejections")
      .select("order_id")
      .eq("delivery_id", deliveryId);

    const rejectedOrderIds = (rejectedRows || []).map((row) => row.order_id);

    let query = supabase
      .from("orders")
      .select("*, stores(name)")
      .is("delivery_id", null)
      .eq("status", OrderStatus.PENDING)
      .order("created_at", { ascending: false });

    if (rejectedOrderIds.length > 0) {
      query = query.not("id", "in", `(${rejectedOrderIds.join(",")})`);
    }

    const { data, error } = await query;
    if (error) throw Boom.internal(error.message);
    return data || [];
  }

  public async acceptOrder(
    orderId: string,
    deliveryId: string,
  ): Promise<Order> {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) throw Boom.notFound("Order not found");
    if (order.status === OrderStatus.ACCEPTED)
      throw Boom.badRequest("Order already accepted");

    const { data, error } = await supabase
      .from("orders")
      .update({ delivery_id: deliveryId, status: OrderStatus.ACCEPTED })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw Boom.internal(error.message);
    return data;
  }

  public async rejectOrder(orderId: string, deliveryId: string): Promise<void> {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) throw Boom.notFound("Order not found");

    const { error } = await supabase
      .from("order_rejections")
      .insert({ order_id: orderId, delivery_id: deliveryId });

    if (error) throw Boom.internal(error.message);
  }

  public async getOrdersByDeliveryId(deliveryId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, stores(name)")
      .eq("delivery_id", deliveryId)
      .order("created_at", { ascending: false });

    if (error) throw Boom.internal(error.message);
    return data || [];
  }

  public async getOrdersByStoreId(storeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, stores(name)")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) throw Boom.internal(error.message);
    return data || [];
  }

  public async getOrderOwnership(id: string): Promise<{ id: string; delivery_id: string | null; store_id: string } | null> {
    const { data } = await supabase
      .from("orders")
      .select("id, delivery_id, store_id")
      .eq("id", id)
      .single();
    return data || null;
  }

  public async getOrderById(id: string): Promise<Order | null> {
    const query = `
      SELECT id, user_id, store_id, delivery_id, status, created_at,
             ST_Y(destination::geometry) as delivery_latitude,
             ST_X(destination::geometry) as delivery_longitude,
             ST_Y(delivery_position::geometry) as delivery_pos_latitude,
             ST_X(delivery_position::geometry) as delivery_pos_longitude
      FROM orders
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}
