import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../services/order.service";

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const updateQuantity = (productId: string, quantity: number) => {
    const updatedCart = cart
      .map((item) =>
        item.product_id === productId ? { ...item, quantity } : item,
      )
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    if (updatedCart.length === 0) {
      localStorage.removeItem("cart_store_id");
    }
  };

  const handleCreateOrder = async () => {
    const storeId = localStorage.getItem("cart_store_id");

    if (!storeId || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      await createOrder({
        store_id: storeId,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      localStorage.removeItem("cart");
      localStorage.removeItem("cart_store_id");
      setCart([]);

      alert("Order created successfully");
      navigate("/consumer/my-orders");
    } catch (error) {
      console.error(error);
      alert("Could not create order");
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🛒 Cart</h1>

        {cart.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <span className="text-6xl mb-4">🛒</span>
              <p className="text-lg text-base-content/60">Your cart is empty</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => navigate("/consumer/stores")}
              >
                Browse stores
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-6">
              {cart.map((item) => (
                <div key={item.product_id} className="card bg-base-100 shadow">
                  <div className="card-body flex flex-row items-center justify-between py-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-base-content/60">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className="btn btn-sm btn-outline btn-circle"
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="font-bold text-lg w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-sm btn-outline btn-circle"
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold text-primary text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleCreateOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner" />
                  ) : (
                    "Place order"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
