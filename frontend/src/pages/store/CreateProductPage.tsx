import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "../../services/product.service";

export const CreateProductPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createProduct({ name, price: Number(price) });
      alert("Product created successfully");
      navigate("/store/my-store");
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Could not create product");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-2">
            ➕ Create Product
          </h1>
          <p className="text-center text-base-content/60 mb-4">
            Add a new product to your store
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Product name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Burger, Pizza..."
                className="input input-bordered w-full"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Price</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered w-full"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">
              Create product
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-base-content/60">
            <Link to="/store/my-store" className="link link-primary">
              ← Go back
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
