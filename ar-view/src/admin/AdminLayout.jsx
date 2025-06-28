import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode toggle state

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="fixed top-0   w-full z-50">
          <AdminHeader
            toggleSidebar={toggleSidebar}
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
          />
        </div>
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="hidden md:block  mt-16 bg-gray-800">
          <AdminSidebar toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex mt-16   flex-col">
        {/* Header */}
        

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 p-6">
            <Outlet />
          </main>

          {/* Footer */}
          
           
          <div className="bg-sky-100 py-6 px-4 h-48 flex mb-8 mx-4 items-center justify-between border-t border-sky-200 shadow-md rounded-md">
  {/* Left Section: Icon and Description */}
  <div className="flex items-center space-x-4">
    {/* React Icon */}
    <div className="text-sky-600 text-4xl">
      <i className="ri-settings-3-line"></i>
    </div>

    {/* Text Content */}
    <div>
      <h2 className="text-xl font-semibold text-gray-800">
        Manage Your Admin Panel Efficiently
      </h2>
      <p className="text-sm text-gray-600">
        Explore advanced tools and settings to streamline your workflow.
      </p>
    </div>
  </div>

  {/* Right Section: Call-to-Action */}
  
</div>


        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
     
    </div>
  );
};

export default AdminLayout;
