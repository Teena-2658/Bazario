const Hero = () => {
  return (
    <div className="max-w-7xl mx-auto mt-4 px-4">
      <div className="grid grid-cols-4 gap-4">
        
        {/* Main Banner */}
        <div className="col-span-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl h-64 p-8 flex items-center justify-between text-white shadow">
          <div>
            <h2 className="text-3xl font-bold mb-3">
              Big Sale is Live 🔥
            </h2>
            <p className="text-lg">
              Up to 70% off on Electronics
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
            alt="phone"
            className="h-48 rounded-lg"
          />
        </div>

        {/* Side Banner */}
        <div className="bg-orange-500 rounded-xl h-64 p-6 text-white shadow flex flex-col justify-center">
          <h3 className="text-xl font-semibold">
            Fashion Deals
          </h3>
          <p className="mt-2">Starting ₹499</p>
        </div>

      </div>
    </div>
  );
};

export default Hero;
