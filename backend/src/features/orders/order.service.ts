import Boom from "@hapi/boom";
import { supabase } from "../../config/supabase";
import { CreateOrderDTO, Order } from "./order.types";

export class OrderService {
  public async createOrder(order: CreateOrderDTO): Promise<Order> {
    if (!order.store_id) throw Boom.badRequest("store_id is required");
    if (!order.items || order.items.length === 0)
      throw Boom.badRequest("items are required");

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: order.user_id,
        store_id: order.store_id,
        delivery_id: null,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw Boom.internal(orderError.message);

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
      .eq("status", "pending")
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
    if (order.status === "accepted")
      throw Boom.badRequest("Order already accepted");

    const { data, error } = await supabase
      .from("orders")
      .update({ delivery_id: deliveryId, status: "accepted" })
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

  public async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }
}
