import Boom from "@hapi/boom";
import { supabase } from "../../config/supabase";
import { CreateProductDTO, Product } from "./product.types";

export class ProductService {
  public async getProductsByStoreId(storeId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .order("name", { ascending: true });

    if (error) throw Boom.internal(error.message);
    return data || [];
  }

  public async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  }

  public async createProduct(product: CreateProductDTO): Promise<Product> {
    if (
      !product.name ||
      product.price === undefined ||
      product.price === null
    ) {
      throw Boom.badRequest("name and price are required");
    }

    if (product.price < 10000) {
      throw Boom.badRequest("El precio mínimo debe ser mayor o igual a 10.000");
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        store_id: product.store_id,
        name: product.name,
        price: product.price,
      })
      .select()
      .single();

    if (error) throw Boom.internal(error.message);
    return data;
  }
}
