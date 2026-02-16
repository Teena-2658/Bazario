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

        <div className="mt-6 space-y-6 ">

          <ProductRow
  title="Spotlight's On"
  url="http://localhost:5000/api/products/section/spotlight"
/>

<ProductRow
  title="Trends You May Like"
  url="http://localhost:5000/api/products/section/trending"
/>

<ProductRow
  title="In Demand"
  url="http://localhost:5000/api/products/section/indemand"
/>

<ProductRow
  title="On Everybody's List"
  url="http://localhost:5000/api/products/section/everybody"
/>


        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Home;
