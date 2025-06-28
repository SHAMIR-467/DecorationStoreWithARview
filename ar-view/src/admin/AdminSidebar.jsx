import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import ProductView from "./products/productView";
//import OrdersPage from "./orders/page/OrdersPage"
//import ProductUpload from './products/productUpload';

import {
  MdDashboard,
  MdShoppingCart,
  MdPeople,
  MdSettings,
  MdOutlineBarChart,
  MdLogout,
  MdMenu,
} from "react-icons/md";
import { BiCategory } from "react-icons/bi";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Sidebar toggle
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", icon: <MdDashboard />, path: "/admin/dashboard" },
    { name: "Products", icon: <MdShoppingCart />, path: "/admin/product-view" },
    { name: "Categories", icon: <BiCategory />, path: "/admin/categories" },
    { name: "Orders", icon: <MdOutlineBarChart />, path: "/admin/order" },
    { name: "Settings", icon: <MdSettings />, path: "/admin/settings" },
    {
      name: "Analytics",
      icon: <MdOutlineBarChart />,
      path: "/admin/analytics",
    },
  ];

  return (
    <div
      className={`flex flex-col h-screen bg-gray-800 text-white ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center  justify-between px-4 py-3 border-b border-gray-700">
        {/* Show Admin text only when sidebar is open */}
        {isOpen && (
          <h1 className="text-xl font-bold transition-all duration-300">
            Admin
          </h1>
        )}
        {/* Toggle Button - Always Visible */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
        >
          <MdMenu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Menu */}
      <nav className="flex flex-col mt-4 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="flex items-center px-4 py-3 hover:bg-gray-700 transition-all"
          >
            {/* Show only icons when sidebar is closed */}
            <div className="h-6 w-6">{item.icon}</div>
            {/* Show names only when sidebar is open */}
            <span
              className={`ml-4 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <NavLink
          to="/logout"
          className="flex items-center px-4 py-3 hover:bg-gray-700 transition-all"
        >
          <MdLogout className="h-6 w-6" />
          <span
            className={`ml-4 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Logout
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
