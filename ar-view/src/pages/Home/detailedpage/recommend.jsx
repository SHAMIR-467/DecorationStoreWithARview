import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SimilarProducts = ({ currentCategory }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("Similar Items");

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!currentCategory) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const categoryRes = await axios.get(
          `/api/products/category/${currentCategory}`
        );

        let products = categoryRes?.data?.products || [];

        if (products.length === 0) {
          const allRes = await axios.get(`/api/products`);
          products = allRes?.data?.products || [];
          setTitle("Recommended For You");
        } else {
          setTitle("Similar Items");
        }

        const shuffled = [...products].sort(() => Math.random() - 0.5);
        const randomizedProducts = shuffled.slice(0, 5);

        setSimilarProducts(randomizedProducts);
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [currentCategory]);

  if (loading) return <></>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (similarProducts.length === 0) return null;

  return (
    <div className="my-12 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mt-8 ml-4 md:ml-8 mb-4">
        {title}
      </h1>

      <div className="relative">
        <div className="flex overflow-x-auto space-x-6 px-2 scrollbar-hide">
          {similarProducts.map((product) => (
            <Link
              to={`/home/product/${product._id}`}
              key={product._id}
              className="min-w-[240px] max-w-[240px] flex-shrink-0 bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            >
              <img
                src={product.images[0].url}
                alt={product.productName}
                className="w-full h-40 object-cover rounded-t-2xl"
              />
              <div className="p-3">
                <h2 className="text-base font-semibold truncate">
                  {product.productName}
                </h2>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-green-600 font-bold">
                    RS: {product.discountedPrice || product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarProducts;
