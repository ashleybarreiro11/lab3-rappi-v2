import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductsByStore } from "../../services/product.service";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export const ProductsPage = () => {
  const { storeId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) return;
      try {
        const data = await getProductsByStore(storeId);
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, [storeId]);

  const addToCart = (product: Product) => {
    const currentCart: CartItem[] = JSON.parse(
      localStorage.getItem("cart") || "[]",
    );
    const currentStoreId = localStorage.getItem("cart_store_id");

    if (currentStoreId && currentStoreId !== storeId) {
      alert("You can only buy from one store at a time");
      return;
    }

    const existingItem = currentCart.find(
      (item) => item.product_id === product.id,
    );
    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = currentCart.map((item) =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      updatedCart = [
        ...currentCart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    localStorage.setItem("cart_store_id", String(storeId));
    alert("Product added to cart");
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🛍️ Products</h1>
          <Link to="/consumer/cart" className="btn btn-outline btn-primary">
            🛒 Go to cart
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <span className="text-6xl mb-4">🏪</span>
              <p className="text-lg text-base-content/60">
                No products available
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">{product.name}</h3>
                  <p className="text-primary font-bold text-xl">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="card-actions mt-2">
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => addToCart(product)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
