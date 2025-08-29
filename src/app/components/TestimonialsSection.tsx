import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "John Morgan",
      role: "Marketing Consultant",
      content: "Gridspace saved my business trip! Found a perfect workspace with reliable internet in minutes. The booking process was seamless.",
      rating: 5,
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Jessica Wright",
      role: "Freelancer Developer",
      content: "As a freelancer, I need flexible workspaces. Gridspace's variety and quality are unmatched. Plus, the rates are very reasonable.",
      rating: 5,
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Derek Woods",
      role: "Product Manager",
      content: "The verification process gives me confidence. Every space I've booked has been exactly as described. Excellent platform.",
      rating: 5,
      avatar: "/api/placeholder/60/60"
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of professionals who trust Gridspace for their workspace needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="space-y-6">
                {/* Quote Icon */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Quote className="h-6 w-6 text-orange-500" />
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-600 leading-relaxed text-center">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex justify-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
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
