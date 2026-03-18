import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth.service";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"consumer" | "store" | "delivery">(
    "consumer",
  );
  const [storeName, setStoreName] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await register({
        name,
        email,
        password,
        role,
        storeName: role === "store" ? storeName : undefined,
      });
      alert("User created successfully");
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-2">📝 Register</h1>
          <p className="text-center text-base-content/60 mb-4">
            Create your account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "consumer" | "store" | "delivery")
                }
              >
                <option value="consumer">Consumer</option>
                <option value="store">Store</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {role === "store" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Store name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pizza Palace"
                  className="input input-bordered w-full"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-2">
              Register
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
