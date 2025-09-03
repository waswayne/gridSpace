export default function Newsletter() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-[#002F5B] mb-4 md:mb-6">
          Join the Grid
        </h2>
        <p className="text-base md:text-2xl text-[#121212] mb-6 md:mb-8">
          Get workspace tips, updates, and exclusive offers straight to your
          inbox.
        </p>

        <div className="bg-white border border-[#F25417] rounded-lg p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 text-base md:text-lg text-gray-500 outline-none"
            />
            <button className="px-6 py-3 bg-[#F25417] text-white font-bold rounded-lg hover:bg-[#E04A0F] w-full md:w-auto">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
