import Navbar from "../components/Navbar";
import BannerSlider from "../components/BannerSlider";
import Categories from "../components/Categories";
import ProductRow from "../components/ProductRow";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4">

        <div className="mt-4">
          <BannerSlider />
        </div>

        <div className="mt-4 bg-white rounded-lg shadow">
          <Categories />
        </div>

        {/* Multiple Product Sections */}

        <div className="mt-6 space-y-6">

          <ProductRow
            title="Spotlight's On"
            url="https://dummyjson.com/products/category/smartphones?limit=12"
          />

          <ProductRow
            title="Trends You May Like"
            url="https://dummyjson.com/products/category/womens-dresses?limit=12"
          />

          <ProductRow
            title="In Demand"
            url="https://dummyjson.com/products/category/laptops?limit=12"
          />

          <ProductRow
            title="On Everybody's List"
            url="https://dummyjson.com/products/category/fragrances?limit=12"
          />

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Home;
