import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts
import AuthLayout from "./auth/layout";
import CustomerLayout from "./components/userlayout/CustomerLayout";
import AdminLayout from "./admin/AdminLayout";

// Components
import ScrollToTop from "./utiles";
import Chatbot from "./pages/chatbot/chatbot";
//import Chat from "./chatbot2";
// Customer Pages
import Home from "./pages/Home/home";
import AboutShop from "./pages/AboutShop/aboutshop";

import BlogPage from "./pages/BlogePage/blogepage";
import Contact from "./pages/Contact/contact";

import Error404 from "./pages/error404";
import ProductDetail from "./pages/Home/detailedpage/detailedPage";
import CartPage from "./components/action/CartPage";
import ComparePage from "./components/action/ComparePage";
import WishlistPage from "./components/action/WishlistPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import UserProfile from "./components/profile/userprofile";

import SimilarItemsRoutes from "./similaritems";
//////////////////////////////////////////////////////////
import "react-toastify/dist/ReactToastify.css";
////////////////////////////////////////////////////////////
import PurchaseGuide from "./pages/perchase_guide/purchase_guide";
import TermsAndConditions from "./pages/term&conditions/terms_policy";
import Checkout from "./pages/checkout/Checkout";
import OrdersList from "./pages/checkout/OrdersList";
import OrderDetail from "./pages/checkout/OrderDetail";
import OrderTracking from "./pages/checkout/orderTracking";
// Admin Pages
import Dashboard from "./admin/dashboard/Dashboard";
import ProductUpload from "./admin/products/productUpload";
import ProductView from "./admin/products/productView";
import Categories from "./admin/Categories/Categories";
import OrderManagement from "./admin/orders/orders";
import SiteSettings from "./admin/settings/SiteSettings";
import ProductEdit from "./admin/products/ProductEdit";
import Analytics from "./admin/Analytics/Analytics";
import ARView from "./pages/Home/detailedpage/arview/ARview";

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles = ["buyer", "seller"] }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const location = useLocation(); // Get the current URL location

  // If user is not logged in, redirect to login with a return path
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user role is invalid, redirect to home page
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={["seller"]}>{children}</ProtectedRoute>;
};

const CustomerRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={["buyer"]}>{children}</ProtectedRoute>;
};

function App() {
  const location = useLocation();
  const showChatbot = ![
    "/product/:id/ar-view",

    "/auth/login",
    "/auth/register",
  ].includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Public Home Page */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutShop />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="purchase-guide" element={<PurchaseGuide />} />
          <Route path="terms-policy" element={<TermsAndConditions />} />

          <Route
            path="checkoutpage/:id"
            element={
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            }
          />
          <Route
            path="orders"
            element={
              <CustomerRoute>
                <OrdersList />
              </CustomerRoute>
            }
          />
          <Route
            path="orders/user/:orderId"
            element={
              <CustomerRoute>
                <OrderDetail />
              </CustomerRoute>
            }
          />
          <Route
            path="/Order-tracking"
            element={
              <CustomerRoute>
                <OrderTracking />
              </CustomerRoute>
            }
          />
        </Route>

        {/* Protected Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route
            path="deals"
            element={
              <CustomerRoute>
                <div className="py-10"></div>
              </CustomerRoute>
            }
          />

          <Route
            path="home/product/:id"
            element={
              //   <CustomerRoute>
              <ProductDetail />
              // </CustomerRoute>
            }
          />

          <Route
            path="wishlist"
            element={
              <CustomerRoute>
                <WishlistPage />
              </CustomerRoute>
            }
          />
          <Route
            path="compare"
            element={
              <CustomerRoute>
                <ComparePage />
              </CustomerRoute>
            }
          />
          <Route
            path="cart"
            element={
              <CustomerRoute>
                <CartPage />
              </CustomerRoute>
            }
          />
          <Route
            path="account"
            element={
              <CustomerRoute>
                <UserProfile />
              </CustomerRoute>
            }
          />
          <Route
            path="SimilarItemsRoutes/similar-items"
            element={
              <CustomerRoute>
                <SimilarItemsRoutes />
              </CustomerRoute>
            }
          />
        </Route>

        {/* AR and VR Routes
        <Route path="/ar-view/product/:id" element={<ARView />} /> */}
        <Route path="/product/:id/ar-view" element={<ARView />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="product-upload" element={<ProductUpload />} />

          <Route path="product/:id" element={<ProductEdit />} />
          <Route path="product-view" element={<ProductView />} />
          <Route path="analytics" element={<Analytics />} />

          <Route path="categories" element={<Categories />} />
          <Route path="order" element={<OrderManagement />} />
          <Route path="settings" element={<SiteSettings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Error404 />} />
      </Routes>

      {/* Fixed Chatbot */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 z-[9999]">
          <Chatbot />
        </div>
      )}
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
