import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/signup`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.success(data.message);
      navigate("/login");
      localStorage.setItem("intToken", data.token);
    } catch (err: any) {
      setError(err.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900 p-6">
      <div className="bg-slate-800 shadow-lg rounded-xl w-full max-w-md p-8 space-y-6 border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Sign Up</h2>
          <p className="text-sm text-gray-400 mt-2">Create your account</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 px-4 rounded-lg bg-slate-700 text-gray-200 placeholder-gray-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 px-4 rounded-lg bg-slate-700 text-gray-200 placeholder-gray-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition duration-200"
          >
            Register
          </button>

          <div className="text-sm text-center text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-indigo-400 cursor-pointer hover:underline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
