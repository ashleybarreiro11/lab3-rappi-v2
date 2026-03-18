import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStores } from "../../services/store.service";
import { logout } from "../../services/auth.service";

interface Store {
  id: string;
  name: string;
  is_open: boolean;
}

export const StoresPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getStores();
        setStores(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStores();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🏪 Stores</h1>
          <div className="flex gap-3">
            <Link to="/consumer/cart" className="btn btn-outline btn-primary">
              🛒 Cart
            </Link>
            <Link to="/consumer/my-orders" className="btn btn-outline">
              📦 My Orders
            </Link>
            <button
              className="btn btn-error btn-outline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <span className="text-6xl mb-4">🏪</span>
              <p className="text-lg text-base-content/60">
                No stores available
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="card-title">{store.name}</h3>
                    <span
                      className={`badge ${store.is_open ? "badge-success" : "badge-error"}`}
                    >
                      {store.is_open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="card-actions mt-4">
                    <Link
                      to={`/consumer/stores/${store.id}/products`}
                      className={`btn btn-primary w-full ${!store.is_open ? "btn-disabled" : ""}`}
                    >
                      View products
                    </Link>
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
