import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Quantity Measurement
          </h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Signup Card */}
        <form
          onSubmit={handleSubmit}
          className="
            bg-white rounded-lg shadow-xl p-8
            animate-scale-in
            transition-all duration-300
          "
        >
          {/* Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                focus:border-blue-600 focus:outline-none
                transition-colors duration-200
                text-gray-900
              "
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                focus:border-blue-600 focus:outline-none
                transition-colors duration-200
                text-gray-900
              "
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                focus:border-blue-600 focus:outline-none
                transition-colors duration-200
                text-gray-900
              "
              placeholder="••••••••"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="
                w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                focus:border-blue-600 focus:outline-none
                transition-colors duration-200
                text-gray-900
              "
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 bg-blue-600 text-white font-bold rounded-lg
              hover:bg-blue-700 transition-all duration-300
              transform hover:scale-105 disabled:scale-100 disabled:opacity-70
              mb-4
            "
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
