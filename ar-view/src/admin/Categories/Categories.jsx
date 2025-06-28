import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const Host = "http://localhost:5000";

  useEffect(() => {
    const fetchProductsAndGroupByCategory = async () => {
      try {
        const response = await axios.get(`${Host}/api/products`);
        const products = response.data.products || [];

        const categoryMap = {};
        products.forEach((product) => {
          const categoryName = product.category || "Uncategorized";
          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = {
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
              products: [],
              image: product.images?.[0] || null,
            };
          }
          categoryMap[categoryName].products.push(product);
        });

        const categoriesArray = Object.values(categoryMap);
        setCategories(categoriesArray);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndGroupByCategory();
  }, []);

  const handleViewDetails = (product) => {
    navigate(`/admin/product/${product._id}`, { state: { product } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading categories: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Shop by Categories
        </h1>

        {categories.length === 0 ? (
          <div className="text-center py-10">No categories found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      category.image?.url ||
                      "https://via.placeholder.com/300?text=No+Image"
                    }
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {category.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {category.products.length} products available
                  </p>

                  <div className="space-y-2">
                    {category.products.slice(0, 3).map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => handleViewDetails(product)}
                      >
                        <img
                          src={
                            product.images?.[0]?.url ||
                            "https://via.placeholder.com/50"
                          }
                          alt={product.productName}
                          className="w-10 h-10 object-cover rounded mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {product.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${product.price?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    ))}
                    {category.products.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{category.products.length - 3} more products
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;
