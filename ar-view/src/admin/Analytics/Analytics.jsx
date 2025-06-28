import React, { useEffect, useState } from "react";
import { Bar, Doughnut, Radar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import {
  MdOutlineInsights,
  MdInventory2,
  MdStarRate,
  MdTimeline,
  MdAttachMoney,
  MdAssessment,
  MdBarChart,
  MdInfo,
} from "react-icons/md";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const SellerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // week, month, year
  const [analyticsData, setAnalyticsData] = useState({
    products: [],
    orders: [],
    comments: [],
    orderStats: {
      labels: [],
      data: [],
    },
    categoryStats: {
      labels: [],
      data: [],
    },
    reviewStats: {
      labels: [],
      data: [],
    },
    revenueStats: {
      labels: [],
      data: [],
    },
  });

  // Static default data for charts when no real data is available
  const getDefaultOrderStats = (timePeriod) => {
    if (timePeriod === "week") {
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: [2, 1, 3, 0, 2, 4, 1],
      };
    } else if (timePeriod === "month") {
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
        data: [5, 8, 3, 7, 4],
      };
    } else {
      // year
      return {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        data: [12, 19, 15, 8, 22, 14, 17, 16, 23, 18, 21, 13],
      };
    }
  };

  const getDefaultCategoryStats = () => {
    return {
      labels: ["Electronics", "Clothing", "Home", "Books", "Sports", "Beauty"],
      data: [25, 18, 12, 8, 15, 10],
    };
  };

  const getDefaultReviewStats = () => {
    return {
      labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
      data: [4.5, 3.8, 4.2, 4.7, 3.5],
    };
  };

  const getDefaultRevenueStats = (timePeriod) => {
    if (timePeriod === "week") {
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: [150, 120, 180, 90, 200, 250, 170],
      };
    } else if (timePeriod === "month") {
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
        data: [580, 720, 640, 820, 510],
      };
    } else {
      // year
      return {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        data: [
          1200, 1800, 1500, 2200, 1700, 2100, 1900, 2500, 2000, 1800, 2300,
          2700,
        ],
      };
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No auth token found");
          // Set default data when no token is available
          setAnalyticsData({
            products: [],
            orders: [],
            comments: [],
            orderStats: getDefaultOrderStats(period),
            categoryStats: getDefaultCategoryStats(),
            reviewStats: getDefaultReviewStats(),
            revenueStats: getDefaultRevenueStats(period),
          });
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Get seller orders
        const ordersRes = await axios.get(`/api/orders/seller`, config);

        // Get seller products
        const productsRes = await axios.get(
          `/api/products?seller=true`,
          config
        );

        // Get comments for all products
        const products = productsRes.data.products || [];
        const orders = ordersRes.data.orders || [];

        // Fetch comments for each product
        const commentsPromises = products.map((product) =>
          axios.get(`/api/products/${product._id}/comments`)
        );

        const commentsResults = await Promise.all(commentsPromises);
        const allComments = commentsResults.flatMap(
          (res) => res.data.comments || []
        );

        // Process the data
        let orderStatsByTime = generateTimeStats(orders, period);
        let categoryStats = generateCategoryStats(products, orders);
        let reviewStats = generateReviewStats(products, allComments);
        let revenueStats = generateRevenueStats(orders, period);

        // Check if any of the processed data is empty and use defaults if needed
        if (
          orderStatsByTime.labels.length === 0 ||
          orderStatsByTime.data.length === 0
        ) {
          orderStatsByTime = getDefaultOrderStats(period);
        }

        if (
          categoryStats.labels.length === 0 ||
          categoryStats.data.length === 0
        ) {
          categoryStats = getDefaultCategoryStats();
        }

        if (reviewStats.labels.length === 0 || reviewStats.data.length === 0) {
          reviewStats = getDefaultReviewStats();
        }

        if (
          revenueStats.labels.length === 0 ||
          revenueStats.data.length === 0
        ) {
          revenueStats = getDefaultRevenueStats(period);
        }

        setAnalyticsData({
          products,
          orders,
          comments: allComments,
          orderStats: orderStatsByTime,
          categoryStats,
          reviewStats,
          revenueStats,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        // Set default data when there's an error
        setAnalyticsData({
          products: [],
          orders: [],
          comments: [],
          orderStats: getDefaultOrderStats(period),
          categoryStats: getDefaultCategoryStats(),
          reviewStats: getDefaultReviewStats(),
          revenueStats: getDefaultRevenueStats(period),
        });
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [period]);

  // Helper function to generate time-based statistics
  const generateTimeStats = (orders, timePeriod) => {
    const labels = [];
    const data = [];

    // If no orders, return empty arrays
    if (orders.length === 0) {
      return { labels: [], data: [] };
    }

    const today = new Date();

    if (timePeriod === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        labels.push(day.toLocaleDateString("en-US", { weekday: "short" }));

        const dailyOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getDate() === day.getDate() &&
            orderDate.getMonth() === day.getMonth() &&
            orderDate.getFullYear() === day.getFullYear()
          );
        });

        data.push(dailyOrders.length);
      }
    } else if (timePeriod === "month") {
      // Last 30 days grouped by week
      for (let i = 4; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - i * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        labels.push(
          `${weekStart.getDate()}/${
            weekStart.getMonth() + 1
          } - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
        );

        const weekOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd;
        });

        data.push(weekOrders.length);
      }
    } else if (timePeriod === "year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(month.toLocaleDateString("default", { month: "short" }));

        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === month.getMonth() &&
            orderDate.getFullYear() === month.getFullYear()
          );
        });

        data.push(monthOrders.length);
      }
    }

    return { labels, data };
  };

  // Helper function to generate category statistics
  const generateCategoryStats = (products, orders) => {
    // If no products or orders, return empty arrays
    if (products.length === 0 || orders.length === 0) {
      return { labels: [], data: [] };
    }

    // Group products by category
    const categoryMap = new Map();

    products.forEach((product) => {
      const categoryId = product.category?.toString() || "uncategorized";
      const categoryName = product.categoryName || "Uncategorized";

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: categoryName,
          count: 0,
          sales: 0,
        });
      }

      const category = categoryMap.get(categoryId);
      category.count++;
      categoryMap.set(categoryId, category);
    });

    // Add sales data
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product.toString();
        const product = products.find((p) => p._id.toString() === productId);

        if (product) {
          const categoryId = product.category?.toString() || "uncategorized";

          if (categoryMap.has(categoryId)) {
            const category = categoryMap.get(categoryId);
            category.sales += item.quantity;
            categoryMap.set(categoryId, category);
          }
        }
      });
    });

    // Convert to arrays for chart
    const categories = Array.from(categoryMap.values());

    // If no categories with sales, return empty arrays
    if (categories.length === 0) {
      return { labels: [], data: [] };
    }

    return {
      labels: categories.map((c) => c.name),
      data: categories.map((c) => c.sales),
    };
  };

  // Helper function to generate review statistics
  const generateReviewStats = (products, comments) => {
    // If no products or comments, return empty arrays
    if (products.length === 0 || comments.length === 0) {
      return { labels: [], data: [] };
    }

    // Create a map of product ID to average rating
    const productRatings = new Map();

    // Count comments and calculate average rating for each product
    products.forEach((product) => {
      const productComments = comments.filter(
        (comment) => comment.product?.toString() === product._id.toString()
      );

      const totalRating = productComments.reduce((sum, comment) => {
        return sum + (comment.rating || 0);
      }, 0);

      const avgRating =
        productComments.length > 0 ? totalRating / productComments.length : 0;

      productRatings.set(product._id.toString(), {
        name: product.name,
        rating: avgRating.toFixed(1),
        count: productComments.length,
      });
    });

    // Get top 5 products by number of reviews
    const topProducts = Array.from(productRatings.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // If no products with reviews, return empty arrays
    if (topProducts.length === 0) {
      return { labels: [], data: [] };
    }

    return {
      labels: topProducts.map((p) => p.name),
      data: topProducts.map((p) => p.rating),
    };
  };

  // Helper function to generate revenue statistics
  const generateRevenueStats = (orders, timePeriod) => {
    // If no orders, return empty arrays
    if (orders.length === 0) {
      return { labels: [], data: [] };
    }

    const labels = [];
    const data = [];

    const today = new Date();

    if (timePeriod === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        labels.push(day.toLocaleDateString("en-US", { weekday: "short" }));

        const dailyOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getDate() === day.getDate() &&
            orderDate.getMonth() === day.getMonth() &&
            orderDate.getFullYear() === day.getFullYear()
          );
        });

        const dailyRevenue = dailyOrders.reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

        data.push(dailyRevenue);
      }
    } else if (timePeriod === "month") {
      // Last 30 days grouped by week
      for (let i = 4; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - i * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        labels.push(
          `${weekStart.getDate()}/${
            weekStart.getMonth() + 1
          } - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
        );

        const weekOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd;
        });

        const weekRevenue = weekOrders.reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

        data.push(weekRevenue);
      }
    } else if (timePeriod === "year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(month.toLocaleDateString("default", { month: "short" }));

        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === month.getMonth() &&
            orderDate.getFullYear() === month.getFullYear()
          );
        });

        const monthRevenue = monthOrders.reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

        data.push(monthRevenue);
      }
    }

    return { labels, data };
  };

  // Chart configs with fallback to default data if needed
  const orderData = {
    labels: analyticsData.orderStats.labels,
    datasets: [
      {
        label: "Orders",
        data: analyticsData.orderStats.data,
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      },
    ],
  };

  const categoryData = {
    labels: analyticsData.categoryStats.labels,
    datasets: [
      {
        label: "Sales by Category",
        data: analyticsData.categoryStats.data,
        backgroundColor: [
          "#34d399",
          "#60a5fa",
          "#f87171",
          "#fbbf24",
          "#c084fc",
          "#a3e635",
        ],
      },
    ],
  };

  const reviewData = {
    labels: analyticsData.reviewStats.labels,
    datasets: [
      {
        label: "Rating (out of 5)",
        data: analyticsData.reviewStats.data,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "#f43f5e",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const revenueData = {
    labels: analyticsData.revenueStats.labels,
    datasets: [
      {
        label: "Revenue ($)",
        data: analyticsData.revenueStats.data,
        fill: true,
        backgroundColor: "rgba(96, 165, 250, 0.2)",
        borderColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // Calculate totals for the summary cards
  const totalRevenue =
    analyticsData.orders.length > 0
      ? analyticsData.orders
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
          .toFixed(2)
      : "0.00";

  const averageRating =
    analyticsData.comments.length > 0
      ? (
          analyticsData.comments.reduce(
            (sum, comment) => sum + (comment.rating || 0),
            0
          ) / analyticsData.comments.length
        ).toFixed(1)
      : "N/A";

  const totalOrders = analyticsData.orders.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const hasNoData =
    analyticsData.products.length === 0 && analyticsData.orders.length === 0;

  return (
    <div className="flex flex-col bg-gradient-to-r from-gray-100 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto w-full p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <MdOutlineInsights className="text-blue-500" size={30} />
            Analytics Dashboard
          </h1>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Time Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
        </div>

        {/* Data Notice Banner (only shown when using default data) */}
        {hasNoData && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <MdInfo className="text-blue-400 mr-2" size={24} />
              <p className="text-blue-800">
                Data visualization: Your actual analytics will appear here once
                you have sales and products.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <MdAttachMoney className="text-green-500" size={24} />
              <h2 className="text-lg font-semibold text-gray-800">
                Total Revenue
              </h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">${totalRevenue}</p>
            <p className="text-sm text-gray-500 mt-2">
              {period === "week"
                ? "Last 7 days"
                : period === "month"
                ? "Last 30 days"
                : "Last 12 months"}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <MdAssessment className="text-purple-500" size={24} />
              <h2 className="text-lg font-semibold text-gray-800">
                Average Rating
              </h2>
            </div>
            {averageRating !== "N/A" ? (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {averageRating}
                  <span className="text-xl text-yellow-500 ml-1">★</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  From {analyticsData.comments.length} reviews
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">N/A</p>
                <p className="text-sm text-gray-500 mt-2">No reviews yet</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <MdBarChart className="text-blue-500" size={24} />
              <h2 className="text-lg font-semibold text-gray-800">
                Total Orders
              </h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">
              {period === "week"
                ? "Last 7 days"
                : period === "month"
                ? "Last 30 days"
                : "Last 12 months"}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Orders Chart */}
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-600 self-start">
              <MdInventory2 />
              Order Analytics
            </div>
            <div className="w-full h-64">
              <Bar data={orderData} options={chartOptions} />
            </div>
          </div>

          {/* Revenue Line Chart */}
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-indigo-600 self-start">
              <MdTimeline />
              Revenue Analytics
            </div>
            <div className="w-full h-64">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Doughnut */}
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-green-600 self-start">
              <MdInventory2 />
              Sales by Category
            </div>
            <div className="w-full h-64 flex justify-center">
              <Doughnut data={categoryData} options={chartOptions} />
            </div>
          </div>

          {/* Review Radar */}
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-pink-600 self-start">
              <MdStarRate />
              Product Ratings
            </div>
            <div className="w-full h-64 flex justify-center">
              <Radar data={reviewData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Product Performance Table */}
      </div>
    </div>
  );
};

export default SellerAnalytics;
