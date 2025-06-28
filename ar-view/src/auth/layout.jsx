import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import image from "../assets/images/craft1.png";
import image2 from "../assets/images/bg-decor.png";
import image3 from "../assets/images/jar.jpg";

const images = [image, image2, image3];

function AuthLayout() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen w-[90%] bg-sky-50">
      {/* Left Side */}
      <div className="hidden lg:flex items-center justify-center w-1/2 relative overflow-hidden">
        {/* Title */}
        <div className="absolute top-10 mt-8   left-0 right-0 text-center z-10">
          <h1 className="text-4xl font-semibold text-pink-600">
            <b>Decor Dream</b>
          </h1>
          <p className="text-sky-600 mt-2">Your Home, Your Style</p>
        </div>

        {/* Image Slider */}
        <div className="relative w-[80%] h-[500px] rounded-lg overflow-hidden shadow-lg">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out
                ${
                  currentImage === index
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }`}
            >
              <img
                src={image}
                alt={`Decor ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Simple Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 
                ${currentImage === index ? "bg-pink-500 w-4" : "bg-sky-300"}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
