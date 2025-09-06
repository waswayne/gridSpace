export default function FeaturedSpaces() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-5">
      <div className="flex flex-col items-center gap-[20px]">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-[8px] max-w-[613px] text-center">
          <h2 className="font-inter font-bold text-[20px] md:text-[32px] leading-[29px] md:leading-[39px] text-[#002F5B]">
            Popular Locations
          </h2>
          <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[24px] text-[#121212] text-center">
            Explore workspaces in Nigeria&apos;s thriving business districts
          </p>
        </div>

        {/* Locations Grid */}
        <div className="flex flex-col md:flex-row items-center gap-[27px] w-full">
          {/* Lagos Card */}
          <div 
            className="w-full h-[235px] sm:h-[361px] rounded-[8px] relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url(/space4.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-0 left-0 p-[24px_12px]">
              <h3 className="font-inter font-semibold text-[20px] md:text-[32px] leading-[39px] text-white">
                Lagos
              </h3>
              <p className="font-inter font-normal text-[14px] md:text-[18px] leading-[22px] text-white">
                40+ workspace
              </p>
            </div>
          </div>

          {/* Abuja Card */}
          <div 
            className="w-full h-[235px] sm:h-[361px] rounded-[8px] relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.39)), url(/space5.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-0 left-0 p-[24px_12px]">
              <h3 className="font-inter font-semibold text-[20px] md:text-[32px] leading-[39px] text-white">
                Abuja
              </h3>
              <p className="font-inter font-normal text-[14px] md:text-[18px] leading-[22px] text-white">
                20+ workspace
              </p>
            </div>
          </div>

          {/* Port Harcourt Card */}
          <div 
            className="w-full h-[235px] sm:h-[361px] rounded-[8px] relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url(/space6.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-0 left-0 p-[24px_12px]">
              <h3 className="font-inter font-semibold text-[20px] md:text-[32px] leading-[39px] text-white">
                Port Harcourt
              </h3>
              <p className="font-inter font-normal text-[14px] md:text-[18px] leading-[22px] text-white">
                25+ workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
