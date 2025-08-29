import { Lightbulb, CheckCircle, Wallet, FileText } from "lucide-react";

export default function WhyChooseSection() {
  const benefits = [
    {
      icon: <Lightbulb className="h-8 w-8 text-green-500" />,
      title: "Reliable Power & Internet",
      description:
        "Never worry about connectivity with guaranteed backup power and high-speed internet at every location.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-orange-500" />,
      title: "Verified & Secure",
      description:
        "Every workspace is thoroughly vetted and verified to ensure quality, safety, and professionalism.",
    },
    {
      icon: <Wallet className="h-8 w-8 text-purple-500" />,
      title: "Affordable Rates",
      description:
        "Get access to quality workspaces that suit your budget, whether you're booking for a day or a month.",
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Flexible Booking",
      description:
        "Book by the hour, day, or month with easy cancellation and modification options.",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose GridSpace
          </h2>
          <p className="text-xl text-gray-600">
            Experience the difference with our commitment to quality and
            reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
