import { Star, ArrowRight } from "lucide-react";

export default function PopularSpacesSection() {
  const spaces = [
    {
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      price: "N5000/day",
      rating: "4.75",
      image: "/api/placeholder/300/200",
    },
    {
      name: "Digital Space",
      location: "Yaba, Lagos",
      price: "N10,000/day",
      rating: "4.75",
      image: "/api/placeholder/300/200",
    },
    {
      name: "Analyst Coworking Hub",
      location: "Ikeja, Lagos",
      price: "N5000/day",
      rating: "4.75",
      image: "/api/placeholder/300/200",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Popular Spaces in Lagos
          </h2>
          <button className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 font-semibold">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spaces.map((space, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Star className="h-6 w-6 text-orange-500" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    {space.name}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {space.name}
                </h3>
                <p className="text-gray-600 mb-3">{space.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {space.price}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {space.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
