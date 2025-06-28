import { Outlet } from "react-router-dom";
import Header from "../header/header";
import Footer from "../footer/footer";
import Nav from "../nav/nav";

const CustomerLayout = () => {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <Header className="z-101100" />

      {/* Navbar */}
      <Nav />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
