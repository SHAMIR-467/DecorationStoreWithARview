import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Package,
  Truck,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Info,
  RefreshCw,
  Loader2,
} from "lucide-react";

const OrderTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = "7o9s0v0h-fj3k-mth9-w4if-yvlzph603y5l";

  // Extract tracking number from URL parameters if available
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const trackingParam = queryParams.get("trackingNumber");
    const courierParam = queryParams.get("courier");

    if (trackingParam) {
      setTrackingNumber(trackingParam);
      // Optionally auto-track when coming from an order
      handleTrack(null, trackingParam, courierParam || "");
    }

    if (courierParam) {
      setCourier(courierParam);
    }
  }, [location.search]);

  const commonCouriers = [
    { value: "", label: "Auto Detect" },
    { value: "fedex", label: "FedEx" },
    { value: "ups", label: "UPS" },
    { value: "usps", label: "USPS" },
    { value: "dhl", label: "DHL" },
    { value: "tnt", label: "TNT" },
  ];

  const handleTrack = async (
    e,
    overrideTrackingNumber = null,
    overrideCourier = null
  ) => {
    if (e) e.preventDefault();

    const trackingToUse = overrideTrackingNumber || trackingNumber;
    const courierToUse = overrideCourier !== null ? overrideCourier : courier;

    if (!trackingToUse.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First create or get tracking
      const createResponse = await fetch(
        "https://api.trackingmore.com/v4/trackings/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Tracking-Api-Key": apiKey,
          },
          body: JSON.stringify({
            tracking_number: trackingToUse,
            courier_code: courierToUse || null,
          }),
        }
      );

      const createData = await createResponse.json();

      if (!createResponse.ok && createData.meta?.code !== 4016) {
        // 4016 is typically "tracking already exists" which we can ignore
        throw new Error(createData.message || "Failed to create tracking");
      }

      // Then get the tracking details
      const getResponse = await fetch(
        `https://api.trackingmore.com/v4/trackings/${
          courierToUse || ""
        }/${trackingToUse}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Tracking-Api-Key": apiKey,
          },
        }
      );

      const getData = await getResponse.json();

      if (!getResponse.ok) {
        throw new Error(
          getData.message || "Failed to get tracking information"
        );
      }

      setTrackingData(getData.data);
    } catch (err) {
      console.error("Error tracking package:", err);
      setError(err.message || "Failed to track package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "in transit":
      case "pickup":
      case "info received":
        return <Truck className="w-6 h-6 text-blue-500" />;
      case "pending":
      case "notfound":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case "exception":
      case "expired":
      case "undelivered":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in transit":
      case "pickup":
      case "info received":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
      case "notfound":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "exception":
      case "expired":
      case "undelivered":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <h1 className="text-2xl font-bold text-center flex-1 pr-8">
          Order Tracking
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Tracking Form */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Track Your Package
            </h2>

            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label
                  htmlFor="trackingNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tracking Number
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="courier"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Courier (Optional)
                </label>
                <select
                  id="courier"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {commonCouriers.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track Package
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Tracking Results */}
          {trackingData && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Tracking Header */}
              <div className="border-b p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {trackingData.tracking_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {trackingData.courier_code?.toUpperCase()}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full border ${getStatusColor(
                      trackingData.status
                    )} flex items-center`}
                  >
                    {getStatusIcon(trackingData.status)}
                    <span className="ml-2 font-medium">
                      {trackingData.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="font-medium">
                      {trackingData.origin_country || "Not Available"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="font-medium">
                      {trackingData.destination_country || "Not Available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="p-6 border-b bg-blue-50">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Current Status
                </h3>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">
                      {trackingData.status || "Status Unavailable"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {trackingData.current_location ||
                        trackingData.destination_country ||
                        "Location not available"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(trackingData.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="p-6">
                <h3 className="font-semibold flex items-center mb-4">
                  <Clock className="w-4 h-4 mr-2" /> Tracking History
                </h3>

                {trackingData.origin_info?.trackinfo &&
                trackingData.origin_info.trackinfo.length > 0 ? (
                  <div className="space-y-6">
                    {trackingData.origin_info.trackinfo.map((event, index) => (
                      <div key={index} className="flex">
                        <div className="mr-4 relative">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          ></div>
                          {index <
                            trackingData.origin_info.trackinfo.length - 1 && (
                            <div className="absolute top-3 bottom-0 left-1.5 w-0.5 -ml-px bg-gray-200 h-full"></div>
                          )}
                        </div>
                        <div className="pb-2 w-full">
                          <p className="font-medium">
                            {event.StatusDescription || "Status Update"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.Details}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">
                              {formatDate(event.Date)}
                            </p>
                            <p className="text-xs font-medium">
                              {event.checkpoint_location ||
                                event.location ||
                                "Unknown Location"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No tracking events available yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-8">
            <h3 className="font-semibold text-gray-700 mb-4">
              Tracking Information
            </h3>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 flex items-center mb-2">
                  <Info className="w-4 h-4 mr-2" />
                  How to Track
                </h4>
                <p className="text-sm text-blue-700">
                  Enter your tracking number above and click "Track Package" to
                  get the latest status updates for your shipment.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Popular Couriers</h4>
                <ul className="space-y-2">
                  {commonCouriers.slice(1).map((courier) => (
                    <li
                      key={courier.value}
                      className="flex items-center text-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400 mr-1" />
                      {courier.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about your shipment, please contact
                  our customer support team.
                </p>
                <Link
                  to="/contact"
                  className="w-full block text-center bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Contact Support
                </Link>
              </div>

              {trackingData && (
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={(e) => handleTrack(e)}
                    className="w-full flex items-center justify-center text-blue-600 hover:text-blue-800"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Tracking Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
