import { useState, useEffect } from "react";
import image8 from "../../assets/images/craft.jpg";
import SHAMIR from "../../assets/images/shamir2.png";
import hijab from "../../assets/images/hijab.jpg";
import axios from "axios";
import { Link } from "react-router-dom";
function AboutShop() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch testimonials from the contact API
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get("/api/contact");
        setTestimonials(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load testimonials");
        setLoading(false);
        console.error("Error fetching testimonials:", err);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section - Modern and Immersive */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('path-to-pattern.svg')] opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-3xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white leading-tight">
              Discover Our <span className="text-yellow-300">Story</span>
            </h1>
            <p className="text-xl text-gray-100 mb-8">
              Where passion for design meets your dream living space
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                className="bg-white text-blue-900 hover:bg-yellow-300 hover:text-blue-900 px-8 py-3 rounded-full font-semibold transition duration-300 transform hover:scale-105"
              >
                Our Collections
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-full font-semibold transition duration-300 transform hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Our Story - With Visual Interest */}
        <section className="mb-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>
                <img
                  src={image8}
                  alt="Craftsmanship in action"
                  className="rounded-lg shadow-xl relative z-10 w-full hover:shadow-2xl transition duration-500 ease-in-out transform hover:-translate-y-1"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-60"></div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-gray-800 mb-6 relative">
                Our Story
                <span className="absolute bottom-0 left-0 h-1 w-24 bg-yellow-400"></span>
              </h2>
              <div className="space-y-6 text-gray-600">
                <p className="text-lg">
                  Our decoration store began as a dream to transform ordinary
                  spaces into extraordinary havens. With a keen eye for design
                  and a heart full of passion, we embarked on this journey to
                  bring curated decor pieces that tell stories and create
                  memories.
                </p>
                <p className="text-lg">
                  What sets us apart is our commitment to sourcing unique items
                  that combine aesthetic appeal with functionality. Each piece
                  in our collection is carefully selected to ensure it brings
                  both beauty and purpose to your home.
                </p>
                <div className="flex flex-wrap gap-6 mt-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                      <i className="fas fa-medal text-xl"></i>
                    </div>
                    <p className="ml-4 font-medium">Quality Assured</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
                      <i className="fas fa-heart text-xl"></i>
                    </div>
                    <p className="ml-4 font-medium">Customer First</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800">
                      <i className="fas fa-gem text-xl"></i>
                    </div>
                    <p className="ml-4 font-medium">Unique Selection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team - With Modern Card Design */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Meet Our Creative Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The talented individuals who bring your design dreams to reality
            </p>
            <div className="h-1 w-24 bg-yellow-400 mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="group">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="h-64 object-full">
                  <img
                    src={SHAMIR}
                    alt="M.SHAMIR"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    M.SHAMIR
                  </h3>
                  <p className="text-purple-600 mb-4">Interior Designer</p>
                  <p className="text-gray-600">
                    With 8+ years of experience in transforming spaces, Shamir
                    brings creativity and technical expertise to every project.
                  </p>
                  <div className="flex mt-6 space-x-3">
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      <i className="fab fa-linkedin text-lg"></i>
                    </a>
                    <a href="#" className="text-blue-400 hover:text-blue-600">
                      <i className="fab fa-twitter text-lg"></i>
                    </a>
                    <a href="#" className="text-pink-600 hover:text-pink-800">
                      <i className="fab fa-instagram text-lg"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="group">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="h-64 overflow-hidden">
                  <img
                    src={hijab}
                    alt="JASSICCA"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    JASSICCA
                  </h3>
                  <p className="text-purple-600 mb-4">Design Consultant</p>
                  <p className="text-gray-600">
                    Jassicca helps clients visualize their perfect space and
                    guides them through the selection process with expertise.
                  </p>
                  <div className="flex mt-6 space-x-3">
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      <i className="fab fa-linkedin text-lg"></i>
                    </a>
                    <a href="#" className="text-blue-400 hover:text-blue-600">
                      <i className="fab fa-twitter text-lg"></i>
                    </a>
                    <a href="#" className="text-pink-600 hover:text-pink-800">
                      <i className="fab fa-instagram text-lg"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="group">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="h-64 overflow-hidden">
                  <img
                    src={hijab}
                    alt="JACKLINA"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    JACKLINA
                  </h3>
                  <p className="text-purple-600 mb-4">Project Manager</p>
                  <p className="text-gray-600">
                    Jacklina ensures that all design projects are executed
                    flawlessly, on time, and within budget.
                  </p>
                  <div className="flex mt-6 space-x-3">
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      <i className="fab fa-linkedin text-lg"></i>
                    </a>
                    <a href="#" className="text-blue-400 hover:text-blue-600">
                      <i className="fab fa-twitter text-lg"></i>
                    </a>
                    <a href="#" className="text-pink-600 hover:text-pink-800">
                      <i className="fab fa-instagram text-lg"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer - With Interactive Elements */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Premium Collections
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated product categories
            </p>
            <div className="h-1 w-24 bg-yellow-400 mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-90 z-10"></div>
              <div className="absolute inset-0 bg-[url('path-to-furniture-pattern.svg')] opacity-20 z-20"></div>
              <div className="relative z-30 p-8 text-white min-h-96 flex flex-col justify-end transform transition duration-500 group-hover:scale-105">
                <i className="fas fa-couch text-5xl mb-6 text-yellow-300"></i>
                <h3 className="text-2xl font-bold mb-3">Designer Furniture</h3>
                <p className="text-gray-200 mb-6">
                  Elevate your space with our handcrafted furniture pieces that
                  combine comfort with artistic design.
                </p>
                <div
                  href="#"
                  className="inline-block py-2 px-6 bg-white text-blue-900 rounded-full font-semibold transform transition duration-300 hover:bg-yellow-300 hover:scale-105 w-max"
                >
                  Explore Collection
                </div>
              </div>
            </div>

            {/* Category 2 */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-800 opacity-90 z-10"></div>
              <div className="absolute inset-0 bg-[url('path-to-lighting-pattern.svg')] opacity-20 z-20"></div>
              <div className="relative z-30 p-8 text-white min-h-96 flex flex-col justify-end transform transition duration-500 group-hover:scale-105">
                <i className="fas fa-lightbulb text-5xl mb-6 text-yellow-300"></i>
                <h3 className="text-2xl font-bold mb-3">
                  Smart Lighting Solutions
                </h3>
                <p className="text-gray-200 mb-6">
                  Transform your ambiance with our revolutionary smart lighting
                  that adapts to your mood and lifestyle.
                </p>
                <div
                  href="#"
                  className="inline-block py-2 px-6 bg-white text-purple-900 rounded-full font-semibold transform transition duration-300 hover:bg-yellow-300 hover:scale-105 w-max"
                >
                  Explore Collection
                </div>
              </div>
            </div>

            {/* Category 3 */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-indigo-900 opacity-90 z-10"></div>
              <div className="absolute inset-0 bg-[url('path-to-art-pattern.svg')] opacity-20 z-20"></div>
              <div className="relative z-30 p-8 text-white min-h-96 flex flex-col justify-end transform transition duration-500 group-hover:scale-105">
                <i className="fas fa-paint-brush text-5xl mb-6 text-yellow-300"></i>
                <h3 className="text-2xl font-bold mb-3">Curated Artwork</h3>
                <p className="text-gray-200 mb-6">
                  Add a touch of sophistication with our exclusive art pieces
                  from renowned local and international artists.
                </p>
                <div
                  href="#"
                  className="inline-block py-2 px-6 bg-white text-blue-800 rounded-full font-semibold transform transition duration-300 hover:bg-yellow-300 hover:scale-105 w-max"
                >
                  Explore Collection
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials - Integrated with API */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real clients who transformed their spaces with
              us
            </p>
            <div className="h-1 w-24 bg-yellow-400 mx-auto mt-4"></div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
            </div>
          ) : error ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <div>
              {testimonials.length === 0 ? (
                <p className="text-center text-gray-600">
                  No testimonials available yet. Be the first to share your
                  experience!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {testimonials.slice(0, 4).map((testimonial, index) => (
                    <div
                      key={testimonial._id || index}
                      className="bg-white rounded-xl shadow-lg p-8 transform transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xl font-bold text-gray-800">
                            {testimonial.name}
                          </h4>
                          <p className="text-purple-600">
                            {testimonial.subject}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <i className="fas fa-quote-left text-4xl text-gray-200 absolute -top-3 -left-2"></i>
                        <p className="text-gray-600 pl-6 relative z-10">
                          {testimonial.message}
                        </p>
                      </div>
                      <div className="mt-6">
                        <div className="flex text-yellow-400">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View More Button - Only show if there are more than 4 testimonials */}
              {testimonials.length > 4 && (
                <div className="text-center mt-10">
                  <button className="bg-transparent border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-8 py-3 rounded-full font-semibold transition duration-300">
                    View More Testimonials
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Call to Action - Interactive and Eye-catching */}
        <section>
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900"></div>
            <div className="absolute inset-0 bg-[url('path-to-pattern.svg')] opacity-20"></div>
            <div className="relative z-10 px-8 py-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Let's Create Your Dream Space Together
              </h2>
              <p className="text-xl text-gray-100 mb-10 max-w-2xl mx-auto">
                Join our community and get exclusive access to special offers,
                design tips, and early collection previews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <Link
                  to="/contact"
                  className="bg-yellow-400 text-blue-900 font-bold px-8 py-4 rounded-full hover:bg-yellow-300 transition duration-300 transform hover:scale-105"
                >
                  Join Now
                </Link>
              </div>
              <p className="text-gray-300 mt-6">
                By subscribing, you agree to our{" "}
                <Link to="/terms-policy" className="underline hover:text-white">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutShop;
