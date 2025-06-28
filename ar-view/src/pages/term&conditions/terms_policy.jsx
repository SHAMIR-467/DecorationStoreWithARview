import React, { useState } from "react";
import { motion } from "framer-motion";

function TermsAndConditions() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const sections = [
    {
      id: "intro",
      title: "Introduction & Acceptance",
      content: `Welcome to our decoration store website. These Terms and Conditions govern your use of our website, mobile applications, and services, including our augmented reality (AR) features. By accessing or using our services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.

Our website offers home decoration products and features that allow you to visualize products in your space using augmented reality technology. These Terms and Conditions apply to all visitors, users, and customers who access or use our website and services.`,
    },
    {
      id: "account",
      title: "Account Registration",
      content: `To access certain features of our website, including the ability to place orders and use our AR features, you may need to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself.

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.

We reserve the right to suspend or terminate your account if any information you provide is inaccurate, misleading, or incomplete, or if you violate any provision of these Terms and Conditions.`,
    },
    {
      id: "ar",
      title: "Augmented Reality Features",
      content: `Our website offers augmented reality (AR) features that allow you to visualize products in your environment before purchasing. While we strive to provide accurate representations, the AR visualizations are for reference only and may not perfectly reflect the actual size, color, or appearance of products in your space.

To use our AR features, you may need to grant our website permission to access your device's camera. We do not record, store, or share the camera feed or any images captured during the AR experience unless you explicitly choose to save or share them.

The AR features are provided "as is" and may not be available on all devices or in all regions. We reserve the right to modify or discontinue AR features at any time without notice.`,
    },
    {
      id: "products",
      title: "Products & Pricing",
      content: `All product descriptions, images, and specifications are intended to be as accurate as possible. However, colors may appear differently depending on your display settings, and dimensions may have slight variations. We recommend reviewing all product details carefully before making a purchase.

Prices for products are subject to change without notice. We reserve the right to modify or discontinue any product without notice. We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of any product.

In the event that a product is listed at an incorrect price due to typographical error or error in pricing information, we reserve the right to refuse or cancel any orders placed for the product listed at the incorrect price.`,
    },
    {
      id: "orders",
      title: "Order Acceptance & Fulfillment",
      content: `Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute confirmation of our offer to sell. We reserve the right at any time after receipt of your order to accept or decline your order for any reason.

We reserve the right to limit the quantity of items purchased per person, per household, or per order. These restrictions may apply to orders placed by the same account, the same credit card, and also to orders that use the same billing and/or shipping address.

We will make every effort to fulfill all orders, but we cannot guarantee inventory. If an item is out of stock, we may offer you a similar product, or we may cancel the item from your order and issue a refund for the canceled item.`,
    },
    {
      id: "payment",
      title: "Payment Terms",
      content: `We accept various payment methods as indicated on our website. By providing a payment method, you represent and warrant that you are authorized to use the designated payment method and that the payment information you provide is true and accurate.

When you provide your payment information, you authorize us to charge your payment method for the total amount of your order, including taxes, shipping, and handling charges.

For subscription-based services, you authorize us to charge your payment method on a recurring basis until you cancel your subscription. You can manage or cancel your subscriptions through your account settings.`,
    },
    {
      id: "shipping",
      title: "Shipping & Delivery",
      content: `We offer various shipping methods and will process and deliver your order according to the delivery option you selected. Delivery times are estimates and not guaranteed. Factors beyond our control, such as carrier delays or customs processing for international shipments, may affect delivery times.

Risk of loss and title for items purchased from our website pass to you upon delivery of the items to the carrier. For international orders, you are responsible for any import duties, taxes, and customs clearance fees.

If you believe your package is lost or damaged during shipping, please contact our customer service department promptly. We will work with the shipping carrier to resolve the issue according to their policies.`,
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      content: `We accept returns of most items within 30 days of delivery for a full refund or exchange, provided the items are in their original condition with all packaging and tags intact. Certain items, such as custom-made products or clearance items, may not be eligible for return.

To initiate a return, please log into your account and follow the return instructions, or contact our customer service department. You are responsible for return shipping costs unless the item was damaged, defective, or sent in error.

Refunds will be issued to the original payment method once we receive and inspect the returned items. Depending on your payment method, it may take 5-10 business days for the refund to appear on your statement.`,
    },
    {
      id: "privacy",
      title: "Privacy & Data Protection",
      content: `We collect, use, and protect your personal information as described in our Privacy Policy. By using our website and services, you consent to our collection and use of your information as described therein.

Our AR features may collect temporary device data, such as camera positioning information, to function properly. This data is processed on your device and is not stored or transmitted to our servers unless you explicitly choose to save or share AR visualizations.

We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage your cookie preferences through your browser settings.`,
    },
    {
      id: "intellectual",
      title: "Intellectual Property",
      content: `All content on our website, including text, graphics, logos, images, audio clips, digital downloads, data compilations, and software, is the property of our company or our content suppliers and is protected by international copyright laws.

You may not reproduce, distribute, modify, display, perform, or use any materials from our website without our prior written consent. The use of our trademarks, logos, or service marks without our prior written consent is strictly prohibited.

Our AR features and related technologies are protected by patents, copyrights, and other intellectual property rights. You may not reverse engineer, decompile, or disassemble any aspect of our AR technology.`,
    },
    {
      id: "warranties",
      title: "Warranties & Disclaimers",
      content: `We make reasonable efforts to accurately display the colors and images of our products, but we cannot guarantee that your display will accurately reflect the actual color of the product upon delivery.

Our website and services, including AR features, are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that our website will be uninterrupted, timely, secure, or error-free.

Products purchased through our website may be covered by manufacturers' warranties. To the extent possible, we will pass on any such warranties to you. For details regarding a manufacturer's warranty, please consult the documentation included with the product.`,
    },
    {
      id: "limitation",
      title: "Limitation of Liability",
      content: `To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:

(a) your use or inability to use our website, services, or AR features;
(b) any unauthorized access to or use of our servers and/or any personal information stored therein;
(c) any errors, mistakes, or inaccuracies in our content;
(d) any interruption or cessation of transmission to or from our website;
(e) any bugs, viruses, trojan horses, or the like that may be transmitted to or through our website.`,
    },
    {
      id: "disputes",
      title: "Dispute Resolution",
      content: `Any dispute arising from or relating to these Terms and Conditions or your use of our website and services shall be resolved through binding arbitration in accordance with the commercial arbitration rules of the American Arbitration Association.

The arbitration shall be conducted in [Your City, State], and judgment on the arbitration award may be entered in any court having jurisdiction thereof. Either party may seek any interim or preliminary relief from a court of competent jurisdiction necessary to protect their rights pending the completion of arbitration.

Any claim must be brought within one (1) year after the cause of action arises, or such claim or cause of action is barred. Claims made after this time period will not be eligible for arbitration.`,
    },
    {
      id: "changes",
      title: "Changes to Terms",
      content: `We reserve the right to modify these Terms and Conditions at any time. If we make changes, we will post the updated terms on our website and update the "Last Updated" date. Your continued use of our website after any such changes constitutes your acceptance of the new Terms and Conditions.

For significant changes, we may provide additional notice, such as sending you an email notification or displaying a prominent notice on our website. If you do not agree to the updated terms, you must stop using our website and services.

It is your responsibility to review these Terms and Conditions periodically to stay informed of updates.`,
    },
    {
      id: "miscellaneous",
      title: "Miscellaneous Provisions",
      content: `These Terms and Conditions constitute the entire agreement between you and us regarding your use of our website and services.

If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.

Our failure to enforce any right or provision of these Terms and Conditions shall not be considered a waiver of those rights. The waiver of any such right or provision will be effective only if in writing and signed by a duly authorized representative.

These Terms and Conditions operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time.`,
    },
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
          Terms and Conditions
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-gray-500">
          Please review our policies and guidelines for using our services
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white sticky top-4 rounded-xl shadow-md p-4 lg:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contents</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors duration-200 text-gray-700 hover:text-indigo-600"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(section.id);
                    element.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            {/* Terms Updated Notification */}
            <div className="mb-8 bg-indigo-50 rounded-lg p-4 flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">
                  Last Updated: April 1, 2025
                </h3>
                <p className="mt-1 text-sm text-indigo-700">
                  These terms were updated to include information about our new
                  AR features and privacy considerations.
                </p>
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-8">
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <button
                    className="flex justify-between items-center w-full text-left focus:outline-none group"
                    onClick={() => toggleSection(section.id)}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {section.title}
                    </h2>
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        expandedSection === section.id
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedSection === section.id
                            ? "transform rotate-180"
                            : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedSection === section.id ? "auto" : 0,
                      opacity: expandedSection === section.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 prose prose-indigo max-w-none text-gray-700">
                      {section.content.split("\n\n").map((paragraph, idx) => (
                        <p key={idx} className="mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please
              contact us:
            </p>
            <div className="space-y-2">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-indigo-600 mt-1 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-700">
                  Email: shamirahmad042@gmial.com
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-indigo-600 mt-1 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-gray-700">Phone: +923177192467</span>
              </div>
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-indigo-600 mt-1 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-700">
                  Address: <b>DECOR DREAM</b> 123 ,MANDI BHAUIDIN , PANJAB,
                  PAKISTAN
                </span>
              </div>
            </div>
          </div>

          {/* Additional Policies */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Privacy Policy
              </h3>
              <p className="text-sm text-gray-600">
                Learn how we collect, use, and protect your personal
                information.
              </p>
              <a
                href="#"
                className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View Privacy Policy
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Cookie Policy
              </h3>
              <p className="text-sm text-gray-600">
                Information about how we use cookies and similar technologies.
              </p>
              <a
                href="#"
                className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View Cookie Policy
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Shipping Policy
              </h3>
              <p className="text-sm text-gray-600">
                Details about shipping methods, costs, and delivery times.
              </p>
              <a
                href="#"
                className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View Shipping Policy
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Print Version Notice */}
      <div className="mt-12 text-center">
        <button className="inline-flex items-center text-gray-600 hover:text-indigo-600">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Terms and Conditions
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: April 1, 2025
        </p>
      </div>
    </div>
  );
}

export default TermsAndConditions;
