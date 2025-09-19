import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signupApi, loginApi } from "../../../frontend/src/api/Auth";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      console.log("Signup successful:", data);
      // Auto-login after successful signup
      if (data.user) {
        login(data.user);
        redirectBasedOnRole(data.user.role);
      }
    },
    onError: (error: any) => {
      console.error("Signup error:", error);
      setError(error.message || "Signup failed. Please try again.");
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      console.log("Login successful:", data);
      if (data.user) {
        login(data.user);
        redirectBasedOnRole(data.user.role);
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    }
  });

  const redirectBasedOnRole = (role: 'Participant' | 'Admin') => {
    if (role === 'Admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/participant-dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password
      });
    } else {
      signupMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "Participant"
      });
    }
  };

  const isLoading = signupMutation.isPending || loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-blue-600 hover:underline"
            disabled={isLoading}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;