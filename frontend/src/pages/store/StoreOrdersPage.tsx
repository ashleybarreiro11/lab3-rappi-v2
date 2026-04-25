import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoreOrders } from "../../services/order.service";
import { supabase } from "../../services/supabase";

interface Order {
  id: string;
  user_id: string;
  store_id: string;
  stores: { name: string };
  profiles: { name: string };
  delivery_id: string | null;
  status: string;
  created_at?: string;
}

export const StoreOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getStoreOrders();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrders();

    const channel = supabase
      .channel("store-orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          className="btn btn-outline mb-4 flex items-center gap-2"
          onClick={() => navigate("/store/my-store")}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-8">📋 Store Orders</h1>

        {orders.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <span className="text-6xl mb-4">📭</span>
              <p className="text-lg text-base-content/60">No orders yet</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">Order</h3>
                    <span
                      className={`badge ${
                        order.status === "Entregado"
                          ? "badge-success"
                          : order.status === "En entrega"
                          ? "badge-info"
                          : "badge-warning"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-base-content/60 flex flex-col gap-1">
                    <p>
                      <span className="font-medium text-base-content">ID:</span>{" "}
                      {order.id}
                    </p>
                    <p>
                      <span className="font-medium text-base-content">
                        Customer:
                      </span>{" "}
                      {order.user_id}
                    </p>
                    <p>
                      <span className="font-medium text-base-content">
                        Delivery:
                      </span>{" "}
                      {order.delivery_id || "Not assigned yet"}
                    </p>
                    <p>
                      <span className="font-medium text-base-content">
                        Date:
                      </span>{" "}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "No date"}
                    </p>
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
