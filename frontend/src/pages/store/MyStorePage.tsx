import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyStore, updateMyStoreStatus } from "../../services/store.service";
import { getProductsByStore } from "../../services/product.service";
import { logout } from "../../services/auth.service";

interface Store {
  id: string;
  user_id: string;
  name: string;
  is_open: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export const MyStorePage = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await getMyStore();
        setStore(data);
        const productData = await getProductsByStore(data.id);
        setProducts(productData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStore();
  }, []);

  const handleToggleStatus = async () => {
    if (!store) return;
    try {
      const updatedStore = await updateMyStoreStatus(!store.is_open);
      setStore(updatedStore);
    } catch (error) {
      console.error(error);
      alert("Could not update store status");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!store) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-2xl mx-auto">
        {(name || role) && (
          <div className="mb-6">
            {name && <h2 className="text-2xl font-bold">Hola, {name}</h2>}
            {role && <p className="text-base-content/60 capitalize">{role}</p>}
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🏪 My Store</h1>
          <button className="btn btn-error btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{store.name}</h2>
              <span
                className={`badge badge-lg ${store.is_open ? "badge-success" : "badge-error"}`}
              >
                {store.is_open ? "Open" : "Closed"}
              </span>
            </div>
            <div className="card-actions mt-6">
              <button
                className={`btn w-full ${store.is_open ? "btn-error" : "btn-success"}`}
                onClick={handleToggleStatus}
              >
                {store.is_open ? "Close store" : "Open store"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <Link to="/store/create-product" className="btn btn-secondary w-full">
            ➕ Create product
          </Link>
          <Link to="/store/orders" className="btn btn-outline w-full">
            📦 View store orders
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-4">🛍️ My Products</h2>
        {products.length === 0 ? (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center py-10">
              <span className="text-5xl mb-3">📦</span>
              <p className="text-base-content/60">No products yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="card bg-base-100 shadow">
                <div className="card-body py-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-primary font-bold">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
