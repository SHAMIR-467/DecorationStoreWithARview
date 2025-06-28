import React, { useState } from "react";
import { motion } from "framer-motion";

function PurchaseGuide() {
  const [activeTab, setActiveTab] = useState("ordering");

  const tabs = [
    { id: "ordering", label: "How to Order" },
    { id: "payment", label: "Payment Methods" },
    { id: "shipping", label: "Shipping Info" },
    { id: "ar", label: "Using AR Feature" },
    { id: "returns", label: "Returns & Refunds" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Purchase Guide
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-gray-500">
          Everything you need to know about shopping at our decoration store
          with AR technology
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-10">
        <div className="flex overflow-x-auto py-2 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`whitespace-nowrap px-5 py-3 font-medium text-lg rounded-t-lg transition-all duration-200 mx-1 ${
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50 bg-opacity-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
      >
        {activeTab === "ordering" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How to Order
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Browse Our Collection
                    </h3>
                    <p className="mt-1 text-gray-600">
                      Explore our diverse selection of home decorations,
                      furniture, and accessories.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Try Items in Your Space
                    </h3>
                    <p className="mt-1 text-gray-600">
                      Use our AR feature to visualize how products will look in
                      your home before purchasing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Add to Cart
                    </h3>
                    <p className="mt-1 text-gray-600">
                      Select your desired items and quantities, then add them to
                      your shopping cart.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="text-xl font-bold">4</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Review Your Order
                    </h3>
                    <p className="mt-1 text-gray-600">
                      Check your selections, quantities, and total before
                      proceeding to checkout.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="text-xl font-bold">5</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Shipping Information
                    </h3>
                    <p className="mt-1 text-gray-600">
                      Enter your shipping address and select your preferred
                      delivery method.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="text-xl font-bold">6</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Payment & Confirmation
                    </h3>
                    <p className="mt-1 text-gray-600">
                      Complete your purchase using your preferred payment method
                      and receive a confirmation email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-indigo-50 rounded-xl">
              <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                Need Help?
              </h3>
              <p className="text-indigo-600">
                Our customer service team is available to assist you with your
                purchase. Contact us at{" "}
                <span className="font-medium">support@decorstore.com</span> or
                call <span className="font-medium">1-800-DECOR-AR</span>.
              </p>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Payment Methods
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Credit/Debit Cards
                </h3>
                <p className="text-gray-600">
                  We Work on all major credit and debit cards including Visa,
                  and Discover.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Digital Wallets
                </h3>
                <p className="text-gray-600">
                  Work on Convenient payment options including PayPal, Apple
                  Pay, Google Pay, and Shop Pay.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="h-14 w-14 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Financing Options
                </h3>
                <p className="text-gray-600">
                  Work on Flexible payment plans through Affirm, Klarna, and
                  Afterpay for qualified purchases.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Security
              </h3>
              <p className="text-gray-600 mb-4">
                We prioritize the security of your payment information. Our
                website uses industry-standard SSL encryption to protect your
                data during transmission.
              </p>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Verification
                </h4>
                <p className="text-gray-600 mb-4">
                  For your security, we may require additional verification for
                  certain transactions. This helps protect both you and us from
                  fraudulent activities.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Billing Address
                </h4>
                <p className="text-gray-600">
                  Your billing address must match the address associated with
                  your payment method. Discrepancies may result in processing
                  delays.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Shipping Information
            </h2>

            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4">
                  <h3 className="text-xl font-bold text-indigo-800">
                    Delivery Options
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Standard Shipping
                        </h4>
                        <p className="text-sm text-gray-600">
                          Delivery within 5-7 business days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">250</p>
                        <p className="text-sm text-gray-500">
                          Free on orders over 1000
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Express Shipping
                        </h4>
                        <p className="text-sm text-gray-600">
                          Delivery within 2-3 business days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">350</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Overnight Shipping
                        </h4>
                        <p className="text-sm text-gray-600">
                          Next business day delivery
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">$29.99</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Shipping Policies
                </h3>
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Processing Time
                    </h4>
                    <p className="text-gray-600">
                      Orders are typically processed within 1-2 business days
                      after payment confirmation.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Tracking Information
                    </h4>
                    <p className="text-gray-600">
                      Once your order ships, you'll receive a confirmation email
                      with tracking information to monitor your delivery.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      International Shipping
                    </h4>
                    <p className="text-gray-600">
                      We currently ship to select international destinations.
                      International orders may be subject to customs fees and
                      import duties.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Large Items
                    </h4>
                    <p className="text-gray-600">
                      Furniture and oversized items may require special shipping
                      arrangements and longer delivery times. Our team will
                      contact you with details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ar" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Using Our AR Feature
            </h2>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 mb-10">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <h3 className="text-2xl font-bold text-indigo-900 mb-4">
                    Visualize Before You Buy
                  </h3>
                  <p className="text-indigo-700 mb-4">
                    Our augmented reality feature allows you to see exactly how
                    our products will look in your space before making a
                    purchase. No more guesswork about sizes, colors, or how
                    items will fit in your home.
                  </p>
                  <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">
                      Compatible with most modern smartphones and tablets. No
                      additional app download required.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 bg-white p-4 rounded-xl shadow-lg">
                  <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-6">
                      <svg
                        className="h-20 w-20 text-indigo-300 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-gray-500 text-sm">
                        AR Preview Placeholder
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                How to Use AR
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Look for the AR Icon
                  </h4>
                  <p className="text-gray-600">
                    Products that support AR viewing will display an AR icon on
                    the product page.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Tap "View in Your Space"
                  </h4>
                  <p className="text-gray-600">
                    Click the AR button to launch the feature directly in your
                    web browser.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Position Your Camera
                  </h4>
                  <p className="text-gray-600">
                    Point your camera at the floor or surface where you want to
                    place the item.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Adjust Size and Position
                  </h4>
                  <p className="text-gray-600">
                    Use pinch gestures to resize the item and drag to position
                    it exactly where you want.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">5</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Explore Different Options
                  </h4>
                  <p className="text-gray-600">
                    Try different colors or models without leaving AR mode to
                    compare options.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">6</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Capture and Share
                  </h4>
                  <p className="text-gray-600">
                    Take screenshots to save or share with friends and family
                    for feedback.
                  </p>
                </div>
              </div>

              <div className="mt-10 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  AR Troubleshooting
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-indigo-500 mt-0.5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Ensure you have adequate lighting for the AR feature to
                      work properly.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-indigo-500 mt-0.5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Move your device slowly when scanning to help the AR
                      technology map your space.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-indigo-500 mt-0.5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      If AR isn't working, check that your device is compatible
                      and your browser has permission to access your camera.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "returns" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Returns & Refunds
            </h2>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-10">
              <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
                <h3 className="text-xl font-bold text-green-800">
                  Our 30-Day Return Policy
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  We want you to be completely satisfied with your purchase. If
                  you're not happy with your order for any reason, you can
                  return it within 30 days of delivery for a full refund or
                  exchange.
                </p>

                <h4 className="font-semibold text-gray-900 mb-2">
                  Eligible Items
                </h4>
                <p className="text-gray-600 mb-4">
                  Most items are eligible for return if they are in their
                  original condition with all packaging and tags intact.
                  Custom-made items and clearance merchandise may not be
                  eligible for return.
                </p>

                <h4 className="font-semibold text-gray-900 mb-2">
                  Non-Returnable Items
                </h4>
                <ul className="list-disc ml-5 text-gray-600 mb-4">
                  <li>Custom or personalized items</li>
                  <li>Gift cards</li>
                  <li>Items marked as final sale</li>
                  <li>Items that have been used, assembled, or installed</li>
                </ul>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Please note: The customer is responsible for return shipping
                    costs unless the item was damaged, defective, or we sent an
                    incorrect item.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  How to Return an Item
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Initiate Your Return
                      </h4>
                      <p className="mt-1 text-gray-600">
                        Log into your account, go to your order history, and
                        select "Return Item" for the product you wish to return.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Print Return Label
                      </h4>
                      <p className="mt-1 text-gray-600">
                        Print the prepaid return shipping label provided in your
                        email (return shipping fees will be deducted from your
                        refund).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Package Your Item
                      </h4>
                      <p className="mt-1 text-gray-600">
                        Securely pack the item in its original packaging if
                        possible, including all accessories and documentation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <span className="text-xl font-bold">4</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Ship Your Return
                      </h4>
                      <p className="mt-1 text-gray-600">
                        Drop off your package at any authorized shipping
                        location. Keep your tracking number for reference.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Refund Process
                </h3>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Refund Timeline
                  </h4>
                  <p className="text-gray-600 mb-5">
                    Once we receive your return, our team will inspect the item
                    and process your refund. This typically takes 3-5 business
                    days. You'll receive an email notification when your refund
                    has been processed.
                  </p>

                  <h4 className="font-semibold text-gray-900 mb-3">
                    Refund Methods
                  </h4>
                  <p className="text-gray-600 mb-3">
                    Refunds will be issued to the original payment method used
                    for the purchase:
                  </p>
                  <ul className="list-disc ml-5 text-gray-600 mb-5">
                    <li>
                      Credit/debit card refunds may take 5-10 business days to
                      appear on your statement
                    </li>
                    <li>
                      PayPal and other digital wallet refunds typically process
                      within 2-3 business days
                    </li>
                    <li>Store credit refunds are processed immediately</li>
                  </ul>

                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-2">
                      Exchange Option
                    </h4>
                    <p className="text-indigo-700">
                      If you'd prefer to exchange your item rather than receive
                      a refund, you can select this option during the return
                      process. Exchanges are subject to product availability.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Damaged or Defective Items
              </h3>
              <p className="text-gray-700 mb-4">
                If you receive a damaged or defective item, please contact our
                customer service team within 48 hours of delivery. We'll arrange
                for a return or replacement at no cost to you.
              </p>

              <div className="flex items-center">
                <svg
                  className="h-10 w-10 text-indigo-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">
                    Contact Customer Service
                  </p>
                  <p className="text-gray-600">
                    1-800-DECOR-AR or support@decorstore.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="mt-12 text-center">
        <p className="text-gray-500">Last updated: April 2025</p>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default PurchaseGuide;
