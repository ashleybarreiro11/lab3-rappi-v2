import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStoreOrders } from "../../services/order.service";

interface Order {
  id: string;
  user_id: string;
  store_id: string;
  stores: { name: string };
  profiles: { name: string };
  delivery_id: string | null;
  created_at?: string;
}

export const StoreOrdersPage = () => {
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
  }, []);

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">📋 Store Orders</h1>
          <Link to="/store/my-store" className="btn btn-outline">
            ← Go back
          </Link>
        </div>

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
                      className={`badge ${order.delivery_id ? "badge-success" : "badge-warning"}`}
                    >
                      {order.delivery_id ? "Assigned" : "Pending"}
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
