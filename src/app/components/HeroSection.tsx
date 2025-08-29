import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Users,
  Star,
  Lightbulb,
} from "lucide-react";
import Button from "./Button";

export default function HeroSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 col-span-1 lg:col-span-1">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find a flexible{" "}
                <span className="text-orange-500">workspace</span> near you
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover verified, flexible workspaces with reliable power,
                high-speed internet, and everything you need to stay productive
                on the go.
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter location or city"
                    className="flex-1 bg-transparent outline-none text-gray-700"
                  />
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="dd/mm/yy"
                    className="bg-transparent outline-none text-gray-700"
                  />
                </div>
                <Button
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <span>Find a Space</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    50K+ Active Users
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">1200+ Locations</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">4.9/5 Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative col-span-1 lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-orange-100 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Modern Coworking Space
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}