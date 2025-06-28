import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  // State to manage form data, loading, and errors
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    mobile: "",
    address: "",
    role: "buyer", // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters"
      );
      setLoading(false);
      return;
    }

    try {
      const userData = {
        fullName: formData.fullName,
        username: formData.username.toLowerCase(),
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        mobile: formData.mobile,
        address: formData.address,
        role: formData.role,
      };
      console.log("Registration Data:", JSON.stringify(userData, null, 2));
      const response = await axios.post("/api/auth/register", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Registration Successful", response.data);

      // Navigate based on role
      navigate("/auth/login");
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full items-center justify-center flex px-8 bg-gradient-to-br from-white/40 to-white/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6">
        <div className="relative w-96 max-w-5xl backdrop-blur-lg bg-white/30 py-2 px-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
          <h1 className="text-2xl font-light text-gray-700 mb-6 text-center">
            Register Your Account
          </h1>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username and Email */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                  placeholder="Username"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                  placeholder="Password"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>

            {/* Gender and Mobile */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                  placeholder="Mobile Number"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                placeholder="Address"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-white/40 border border-gray-200/50 focus:border-gray-300 focus:ring-0 transition-colors duration-300 outline-none"
                required
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50/50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-black/80 hover:bg-black/90 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-gray-800 hover:underline transition-all duration-300"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
