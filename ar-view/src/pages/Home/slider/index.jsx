import "./index.css";
import Slider from "react-slick";
import image1 from "../../../assets/images/temp2.jpg";
import image3 from "../../../assets/images/wallclock.jpg";
import image2 from "../../../assets/images/shell.jpg";

export default function SimpleSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    customPaging: (i) => <div className="custom-dot"></div>,
    appendDots: (dots) => (
      <div>
        <ul className="flex justify-center space-x-2">{dots}</ul>
      </div>
    ),
  };

  const slides = [
    {
      image: image1,
      title: (
        <h1 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-gray-900">
          Creative{" "}
          <mark className="px-2 text-white bg-gray-900 rounded dark:bg-yellow-900">
            Touches
          </mark>{" "}
          for Style
        </h1>
      ),
      tagline: "Transform Your Home with Modern Designs",
    },
    {
      image: image2,
      title: (
        <h1 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-white">
          GENERATE{" "}
          <mark className="px-2 text-white bg-gray-900 rounded dark:bg-green-900">
            IDEAS
          </mark>{" "}
          for dream
        </h1>
      ),
      tagline: "Transform Your Home with dreams",
    },
    {
      image: image3,
      title: (
        <h1 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-black">
          Elegant{" "}
          <mark className="px-2 text-white bg-gray-900 rounded dark:bg-red-900">
            Living
          </mark>{" "}
          Spaces
        </h1>
      ),
      tagline: "Bring Style and Sophistication to Your Room",
    },
  ];

  return (
    <div className="container mx-auto px-4  relative">
      <div className="absolute inset-0  opacity-50 rounded-lg"></div>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className="slide flex flex-col lg:flex-row items-center  justify-between space-y-6 lg:space-y-0 lg:space-x-6"
          >
            <div className="slide-content absolute inset-0 flex flex-col justify-center items-start text-left space-y-2 px-4 md:space-y-4 md:px-6 lg:px-8">
              {slide.title}
              <p className="text-xs sm:text-sm text-gray-900 md:text-base">
                {slide.tagline}
              </p>

              <button className="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium rounded-lg group">
                <span className="relative px-5 py-2.5 transition-all ease-in "></span>
              </button>
            </div>
            <img
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
