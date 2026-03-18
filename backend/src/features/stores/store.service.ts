import Boom from "@hapi/boom";
import { supabase } from "../../config/supabase";
import { CreateStoreDTO, Store } from "./store.types";

export class StoreService {
  public async getStores(): Promise<Store[]> {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw Boom.internal(error.message);
    return data || [];
  }

  public async getStoreByUserId(userId: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  }

  public async createStore(store: CreateStoreDTO): Promise<Store> {
    const existing = await this.getStoreByUserId(store.user_id);
    if (existing) throw Boom.badRequest("This user already has a store");

    const { data, error } = await supabase
      .from("stores")
      .insert({ user_id: store.user_id, name: store.name })
      .select()
      .single();

    if (error) throw Boom.internal(error.message);
    return data;
  }

  public async updateStoreStatus(id: string, isOpen: boolean): Promise<Store> {
    const { data, error } = await supabase
      .from("stores")
      .update({ is_open: isOpen })
      .eq("id", id)
      .select()
      .single();

    if (error) throw Boom.internal(error.message);
    if (!data) throw Boom.notFound("Store not found");
    return data;
  }
}
