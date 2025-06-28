import React, { useEffect, useState } from "react";
import short from "../../assets/images/bg-decor.png";
import { FaRocket, FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";
function Banner() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const bannerPosition = document.getElementById("banner").offsetTop;
      if (window.scrollY + window.innerHeight > bannerPosition) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="banner"
      className="w-full h-80 md:h-64 py-8 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 relative overflow-hidden rounded-lg shadow-xl mb-4"
    >
      {/* Image on the left side */}
      <div
        className={`absolute left-4 sm:left-16 transition-transform duration-1000 ${
          isScrolled ? "translate-x-0" : "-translate-x-full"
        } top-0 h-full flex items-center`}
      >
        <img
          src={short}
          alt="Banner Image"
          className={`w-32 sm:w-48 md:w-64 h-auto rounded-lg transition-transform duration-2000 ease-out ${
            isScrolled ? "hover:scale-105 shadow-bottom glow-effect" : ""
          }`}
        />
      </div>

      {/* Heading, Input, and Button on the right side */}
      <div
        className={`relative bottom-16 sm:absolute sm:right-20  sm:bottom-8 sm:transform sm:-translate-y-1/2 px-4 sm:px-0 transition-opacity duration-1000 ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center sm:text-left">
          <h1 className="text-xl flex sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6 font-serif tracking-wide drop-shadow-lg">
            Your{" "}
            <span className="bg-blue-600 rounded-lg py-1 px-2 text-slate-100">
              <FaHome />
            </span>{" "}
            ,Your{" "}
            <span className="bg-blue-600 rounded-lg py-1 px-2 text-slate-100">
              Canvas
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-3">
            <Link
              to="/contact"
              className="flex justify-center items-center bg-gradient-to-r from-blue-400 via-blue-600 to-blue-900 hover:from-blue-800 hover:to-purple-800 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl"
            >
              Give your FeedBack <FaRocket className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
