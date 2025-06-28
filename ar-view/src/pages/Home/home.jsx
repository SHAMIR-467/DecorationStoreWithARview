import Catslider from "./slider/catslider";
import SimpleSlider from "./slider/index";
import ProductListing from "./productlist";
import TopProduct from "./toProduct";
function Home() {
  return (
    <>
      {" "}
      <SimpleSlider />
      <h1
        className="
          font-bold 
          text-2xl sm:text-3xl md:text-4xl 
          text-blue-900 
          text-center md:text-left 
          px-4 md:ml-20 
          my-4 md:my-6
          transform 
          transition-all 
          duration-500 
          animate-slide-in-right 
          hover:text-blue-700 
          hover:scale-105"
      >
        Feature Categories
      </h1>
      <Catslider />
      <div className="mx-4">
        <ProductListing />
        <TopProduct />
      </div>
    </>
  );
}

export default Home;
