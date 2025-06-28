import React, { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/contact", formData);
      console.log("Form submitted successfully:", response.data);
      setSubmitted(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred. Please try again later."
      );
      console.error(
        "Error submitting form:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 py-10 px-4">
      {/* Header Section */}
      <header className="text-center py-8 bg-gradient-to-r from-blue-800 to-purple-800 text-white">
        <h1 className="text-4xl font-bold">Get in Touch</h1>
        <p className="mt-2 text-lg">
          We'd love to hear from you! Send us a message below.
        </p>
      </header>

      {/* Contact Form Section */}
      {!submitted ? (
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10">
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Your Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="subject"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Subject"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                id="message"
                rows="6"
                placeholder="Type your message here..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full ${
                loading ? "bg-gray-500" : "bg-blue-700 hover:bg-purple-600"
              } text-white p-3 rounded-md transition duration-200 ease-in-out`}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-10 p-8 text-center">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">
            Thanks for your message!
          </h2>
          <p className="mt-4 text-gray-600">
            We've received your feedback and will get back to you soon.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 bg-blue-700 text-white p-3 rounded-md hover:bg-purple-600 transition duration-200 ease-in-out"
          >
            Send Another Message
          </button>
        </div>
      )}

      {/* Article Section */}
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg mt-10 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Why Choose Our Decoration Store?
        </h2>
        <div className="space-y-4 text-gray-800">
          <p className="flex items-center">
            <FaEnvelope className="mr-2 text-blue-700" />
            At our decoration store, we prioritize offering the finest and
            trendiest decor items to elevate your home.
          </p>
          <p className="flex items-center">
            <FaFacebook className="mr-2 text-blue-700 hover:text-purple-700 transition duration-200 ease-in-out" />
            From chic modern designs to timeless classics, we have everything
            you need to make your space uniquely yours.
          </p>
          <p className="flex items-center">
            <FaInstagram className="mr-2 text-blue-700 hover:text-purple-700 transition duration-200 ease-in-out" />
            We believe in blending elegance with practicality, ensuring that our
            products look great and fit your lifestyle.
          </p>
          <p className="flex items-center">
            <FaTwitter className="mr-2 text-blue-700 hover:text-purple-700 transition duration-200 ease-in-out" />
            Whether you're looking to revamp a single room or your entire home,
            we have just what you need.
          </p>
          <p>
            Our carefully curated collection includes furniture, lighting,
            artwork, and accessories, designed to inspire and create the perfect
            atmosphere in your home.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
