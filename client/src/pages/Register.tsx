import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "author",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      const { token, user } = response.data;
      login(token, user);
      navigate("/");
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.error ?? "Registration failed") : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 dark:text-gray-100">Create account</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-400"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-400"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-gray-400"
            placeholder="Min 8 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            I want to
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="user"
                checked={form.role === "user"}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-300">Buy digital products</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="author"
                checked={form.role === "author"}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-300">Sell digital products</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="text-gray-900 font-medium hover:underline dark:text-gray-100">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Register;
