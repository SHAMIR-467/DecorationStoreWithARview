// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  MdShoppingCart,
  MdAttachMoney,
  MdInventory,
  MdStarRate,
  MdTrendingUp,
  MdPerson,
} from "react-icons/md";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  // States for data
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [products, setProducts] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);

  // API Base URL

  // Fetch all required data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Get seller auth token from localStorage
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Parallel API calls for better performance
        const [productsRes, ordersRes] = await Promise.all([
          axios.get(`/api/products`, { headers }),
          axios.get(`/api/orders/seller`, { headers }),
        ]);

        const sellerProducts = productsRes.data.products || [];
        const sellerOrders = ordersRes.data.orders || [];

        // Calculate total revenue
        const revenue = sellerOrders.reduce(
          (total, order) => total + (order.totalAmount || 0),
          0
        );

        // Process category data for the chart
        const categories = {};
        sellerProducts.forEach((product) => {
          const category = product.category?.name || "Uncategorized";
          categories[category] = (categories[category] || 0) + 1;
        });

        // Process recent months order data
        const last6Months = getLast6Months();
        const monthlyOrders = {};
        last6Months.forEach((month) => {
          monthlyOrders[month] = 0;
        });

        sellerOrders.forEach((order) => {
          const orderDate = new Date(order.createdAt);
          const monthYear = `${orderDate.toLocaleString("default", {
            month: "short",
          })}`;
          if (monthlyOrders.hasOwnProperty(monthYear)) {
            monthlyOrders[monthYear] += 1;
          }
        });

        // Top selling products (by order frequency)
        const productOrderCounts = {};
        sellerOrders.forEach((order) => {
          order.items?.forEach((item) => {
            productOrderCounts[item.product] =
              (productOrderCounts[item.product] || 0) + (item.quantity || 1);
          });
        });

        // Find products with their order counts
        const topProducts = sellerProducts
          .map((product) => ({
            ...product,
            orderCount: productOrderCounts[product._id] || 0,
          }))
          .sort((a, b) => b.orderCount - a.orderCount)
          .slice(0, 5);

        // Update state with all calculated data
        setDashboardData({
          totalSales: sellerOrders.length,
          totalRevenue: revenue.toFixed(2),
          totalOrders: sellerOrders.length,
          totalProducts: sellerProducts.length,
          recentOrders: sellerOrders.slice(0, 5),
          topProducts,
        });

        setProducts(sellerProducts);
        setOrderTrends({
          labels: Object.keys(monthlyOrders),
          values: Object.values(monthlyOrders),
        });
        setCategoryDistribution({
          labels: Object.keys(categories),
          values: Object.values(categories),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to get the last 6 months
  const getLast6Months = () => {
    const months = [];
    const date = new Date();

    for (let i = 0; i < 6; i++) {
      months.unshift(date.toLocaleString("default", { month: "short" }));
      date.setMonth(date.getMonth() - 1);
    }

    return months;
  };

  // Chart data for the sales trend
  const salesTrendData = {
    labels: orderTrends.labels || [],
    datasets: [
      {
        label: "Orders",
        data: orderTrends.values || [],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#3b82f6",
        pointRadius: 4,
      },
    ],
  };

  // Chart data for category distribution
  const categoryData = {
    labels: categoryDistribution.labels || [],
    datasets: [
      {
        data: categoryDistribution.values || [],
        backgroundColor: [
          "#3b82f6", // blue
          "#10b981", // emerald
          "#f59e0b", // amber
          "#ef4444", // red
          "#8b5cf6", // violet
          "#6366f1", // indigo
          "#ec4899", // pink
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Seller Dashboard
      </h1>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sales */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <MdShoppingCart className="text-blue-600 text-2xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-800">
              {dashboardData.totalSales}
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <MdAttachMoney className="text-green-600 text-2xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-gray-800">
              ${dashboardData.totalRevenue}
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <MdInventory className="text-yellow-600 text-2xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Products</p>
            <p className="text-2xl font-bold text-gray-800">
              {dashboardData.totalProducts}
            </p>
          </div>
        </div>

        {/* Customer Rating */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <MdStarRate className="text-purple-600 text-2xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
            <p className="text-2xl font-bold text-gray-800">
              {(
                products.reduce((sum, p) => sum + (p.ratings || 0), 0) /
                (products.length || 1)
              ).toFixed(1)}
              ★
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <MdTrendingUp className="text-blue-600 text-xl mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Order Trends
            </h2>
          </div>
          <div className="h-80">
            <Line data={salesTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center mb-4">
            <MdInventory className="text-green-600 text-xl mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Category Distribution
            </h2>
          </div>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-4">
          <MdInventory className="text-blue-600 text-xl mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Top Products</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dashboardData.topProducts.length > 0 ? (
            dashboardData.topProducts.map((product) => (
              <div
                key={product._id}
                className="bg-gray-50 rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={product.images?.[0]?.url || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h3
                    className="font-medium text-gray-800 truncate"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-medium">
                      ${product.price}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {product.orderCount} sold
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 py-4 text-center text-gray-500">
              No products data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
