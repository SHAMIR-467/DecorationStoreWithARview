/////////////////////////////////////\
// src/components/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  LogOut,
  Edit,
  ChevronDown,
  ChevronUp,
  Shield,
  User,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SiteSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/me");

      if (data && data.data) {
        setUser(data.data);
        setProfileData({
          firstName: data.data.firstName || data.data.username || "",
          lastName: data.data.lastName || "",
          email: data.data.email || "",
          phone: data.data.mobile || data.data.phone || "",
          address: data.data.address || "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  // Call fetchUserData on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.put("/auth/update-profile", profileData);

      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsEditing(false);
      fetchUserData();
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccessMessage("Password changed successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium">Loading your profile...</p>
          <p className="text-gray-500 text-sm mt-2">
            This will just take a moment
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={42} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to load profile
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "Please try again later"}
          </p>
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-900 to-blue-900 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <UserCircle size={72} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <div className="flex items-center space-x-2 text-indigo-100 mt-1">
                    <Mail size={16} />
                    <p>{profileData.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-indigo-200 text-sm mt-2">
                    <Calendar size={16} />
                    <p>
                      Member since{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-15 backdrop-blur-sm rounded-xl text-white hover:bg-opacity-25 transition shadow-lg"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: "profile", label: "Profile", icon: <User size={18} /> },
              { id: "security", label: "Security", icon: <Shield size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-5 text-center font-medium transition flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 bg-opacity-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === "profile" ? (
                <motion.form
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleProfileUpdate}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        disabled={!isEditing}
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 rounded-xl border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                            : "bg-gray-50 border-gray-200"
                        } transition ${
                          isEditing ? "group-hover:border-indigo-300" : ""
                        }`}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        disabled={!isEditing}
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 rounded-xl border ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                            : "bg-gray-50 border-gray-200"
                        } transition ${
                          isEditing ? "group-hover:border-indigo-300" : ""
                        }`}
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          disabled
                          value={profileData.email}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border bg-gray-50 border-gray-200"
                          placeholder="Email"
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          disabled={!isEditing}
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                            isEditing
                              ? "border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                              : "bg-gray-50 border-gray-200"
                          } transition ${
                            isEditing ? "group-hover:border-indigo-300" : ""
                          }`}
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-gray-400" />
                      <textarea
                        name="address"
                        disabled={!isEditing}
                        rows={3}
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: e.target.value,
                          })
                        }
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border resize-none ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                            : "bg-gray-50 border-gray-200"
                        } transition ${
                          isEditing ? "group-hover:border-indigo-300" : ""
                        }`}
                        placeholder="Address"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-100"
                      >
                        <Edit size={18} />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-100"
                        >
                          Save Changes
                        </button>
                      </>
                    )}
                  </div>

                  {(error || successMessage) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl shadow-md ${
                        error
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-green-50 text-green-600 border border-green-100"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {error ? (
                          <XCircle size={20} className="flex-shrink-0" />
                        ) : (
                          <CheckCircle size={20} className="flex-shrink-0" />
                        )}
                        <p>{error || successMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.form>
              ) : (
                <motion.form
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handlePasswordChange}
                  className="space-y-8 max-w-md mx-auto"
                >
                  <div className="text-center mb-6">
                    <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield size={28} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Change Password
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Ensure your account is using a strong password
                    </p>
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 group-hover:border-indigo-300 transition"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 group-hover:border-indigo-300 transition"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 group-hover:border-indigo-300 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-100"
                  >
                    Update Password
                  </button>

                  {(error || successMessage) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl shadow-md ${
                        error
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-green-50 text-green-600 border border-green-100"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {error ? (
                          <XCircle size={20} className="flex-shrink-0" />
                        ) : (
                          <CheckCircle size={20} className="flex-shrink-0" />
                        )}
                        <p>{error || successMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;

//////////////////////////////////////
