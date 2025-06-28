import { Link } from "react-router-dom";
import Facebook from "../../assets/images/fb.png";
import Instagram from "../../assets/images/insta.png";
import LinkedIn from "../../assets/images/linkedin.png";
import Twitter from "../../assets/images/twitter.png";
import Banner from "./baner";
const Footer = () => {
  return (
    <>
      {" "}
      <Banner />
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
          {/* Logo & Description */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-blue-400">
              Make Our Dream
            </h2>
            <p className="text-gray-400">
              Bringing your home decor dreams to life with the finest selection
              of products.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/purchase-guide"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <Link to="/">
                <img
                  src={Facebook}
                  alt="Facebook"
                  className="h-6 w-6 text-white hover:text-blue-400 transition-colors duration-200"
                />
              </Link>
              <Link to="/">
                <img
                  src={Twitter}
                  alt="Twitter"
                  className="h-6 w-6 text-white hover:text-blue-400 transition-colors duration-200"
                />
              </Link>
              <Link to="/">
                <img
                  src={Instagram}
                  alt="Instagram"
                  className="h-6 w-6 text-white hover:text-blue-400 transition-colors duration-200"
                />
              </Link>
              <Link to="/">
                <img
                  src={LinkedIn}
                  alt="LinkedIn"
                  className="h-6 w-6 text-white hover:text-blue-400 transition-colors duration-200"
                />
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">
              Contact Us
            </h3>
            <p className="text-gray-400">Email: support@makeourdream.com</p>
            <p className="text-gray-400">Phone: +1 234 567 890</p>
            <p className="text-gray-400">
              Address: 123 Dream Street, Decor City
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center">
          <p className="text-gray-400">
            &copy; 2024 Make Our Dream. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
