import { Search, CheckCircle, Zap } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Search & Discover",
      description:
        "Browse verified workspaces in your area with detailed photos, amenities and real time availability.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-orange-500" />,
      title: "Book Instantly",
      description:
        "Reserve your perfect workspace instantly with secure payment and flexible booking options.",
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "Work Productively",
      description:
        "Arrive and get productive immediately with reliable power, fast WiFi and all essential amenities.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How GridSpace Works
          </h2>
          <p className="text-xl text-gray-600">
            Get access to productive workspaces in just three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
