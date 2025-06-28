import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Support from "../../assets/images/support.svg";
import Flower from "../../assets/images/flower.svg";
import { Menu, ChevronDown } from "lucide-react";

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = document.getElementById("navbar").offsetTop;
      if (window.scrollY > navbarHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMegaMenuMouseEnter = () => {
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuMouseLeave = () => {
    setIsMegaMenuOpen(false);
  };

  const handlePagesDropdownMouseEnter = () => {
    setIsPagesDropdownOpen(true);
  };

  const handlePagesDropdownMouseLeave = () => {
    setIsPagesDropdownOpen(false);
  };

  const handleSelectChange = (path) => {
    setIsPagesDropdownOpen(false);
    if (path) {
      navigate(path);
    }
  };

  return (
    <div
      id="navbar"
      className={`w-full z-50  shadow-md ${
        isSticky ? "fixed top-0 left-0 bg-white" : "relative"
      }`}
    >
      <header className=" bg-gradient-to-r from-white via-white to-gray-100  shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 flex items-center"
            >
              <img src={Flower} alt="Logo" className="h-10 w-auto mr-2" />
              <span>Make our Dream</span>
            </Link>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-800 focus:outline-none"
            >
              <Menu alt="Menu Icon" className="h-6 w-6" />
            </button>
          </div>

          {/* Menu */}
          <nav
            className={`${
              isMenuOpen ? "block" : "hidden"
            }   w-full md:flex md:items-center md:w-auto`}
          >
            <ul className="md:flex  md:space-x-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-800 px-3 py-2 rounded  hover:text-gray-300  transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/dashboard"
                  className="text-gray-800 px-3 py-2 rounded  hover:text-gray-300  transition-colors duration-200"
                >
                  Vendor
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-800 px-3 py-2 rounded  hover:text-gray-300  transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-800 px-3 py-2 rounded  hover:text-gray-300  transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>{" "}
              <li
                id="pagesDropdown"
                className="relative"
                onMouseEnter={handlePagesDropdownMouseEnter}
                onMouseLeave={handlePagesDropdownMouseLeave}
              >
                <button className="text-gray-800 px-0 py-0  rounded  hover:text-gray-300  transition-colors duration-200">
                  InFo
                  <ChevronDown className="w-5 h-5 inline-flex ml-1" />
                </button>
                {isPagesDropdownOpen && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-[13vw] h-auto bg-white border rounded-md shadow-lg p-4 z-50 transition-all duration-300 ease-in-out">
                    <ul className="py-2">
                      <li></li>

                      <li>
                        <button
                          onClick={() => handleSelectChange("/account")}
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-50  w-full text-left"
                        >
                          My Account
                        </button>
                      </li>

                      <li>
                        <button
                          onClick={() => handleSelectChange("/purchase-guide")}
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-50  w-full text-left"
                        >
                          Purchase Guide
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSelectChange("/terms-policy")}
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-50  w-full text-left"
                        >
                          Terms of Policy
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* Support Section */}
          <Link to="/contact">
            <div className="hidden md:flex items-center">
              <img
                src={Support}
                alt="Support Icon"
                className="h-10 w-10 text-black-900  mr-2"
              />
              <div className="flex flex-col text-gray-800">
                <span className="font-semibold">Support Center</span>
                <span className="text-sm">
                  <b>24/7</b> #<i>900-888</i>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Nav;
