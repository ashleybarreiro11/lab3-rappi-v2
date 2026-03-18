import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  acceptOrder,
  getAvailableOrders,
  rejectOrder,
} from "../../services/order.service";
import { logout } from "../../services/auth.service";

interface Order {
  id: string;
  user_id: string;
  store_id: string;
  stores: { name: string };
  delivery_id: string | null;
  created_at?: string;
}

export const AvailableOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingAction, setLoadingAction] = useState<{
    id: string | null;
    type: "accept" | "reject" | null;
  }>({
    id: null,
    type: null,
  });

  const fetchOrders = async () => {
    try {
      const data = await getAvailableOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const cleanId = String(orderId).trim();
      setLoadingAction({ id: cleanId, type: "accept" });
      await acceptOrder(cleanId);
      alert("Order accepted successfully");
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Could not accept order");
    } finally {
      setLoadingAction({ id: null, type: null });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const cleanId = String(orderId).trim();
      setLoadingAction({ id: cleanId, type: "reject" });
      await rejectOrder(cleanId);
      alert("Order rejected successfully");
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Could not reject order");
    } finally {
      setLoadingAction({ id: null, type: null });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Orders</h1>
          <div className="flex gap-3">
            <Link to="/delivery/my-deliveries" className="btn btn-outline">
              My Deliveries
            </Link>
            <button
              className="btn btn-error btn-outline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <p className="text-lg text-base-content/60">
                No available orders
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">Order</h3>
                    <span className="badge badge-warning">Available</span>
                  </div>

                  <div className="text-sm text-base-content/60 flex flex-col gap-1 mb-4">
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
                        Store:
                      </span>{" "}
                      {order.stores?.name || order.store_id}
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

                  <div className="flex gap-2">
                    <button
                      className="btn btn-accent flex-1"
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={loadingAction.id === order.id}
                    >
                      {loadingAction.id === order.id &&
                      loadingAction.type === "accept"
                        ? "Loading..."
                        : "Accept order"}
                    </button>

                    <button
                      className="btn btn-outline btn-error flex-1"
                      onClick={() => handleRejectOrder(order.id)}
                      disabled={loadingAction.id === order.id}
                    >
                      {loadingAction.id === order.id &&
                      loadingAction.type === "reject"
                        ? "Loading..."
                        : "Reject order"}
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
