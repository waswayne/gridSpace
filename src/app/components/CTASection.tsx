import Button from "./Button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-12 mb-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">
              Ready to Find Your Perfect Workspace?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who trust Gridspace for their
              workspace needs.
            </p>
            <Button
              variant="primary"
              className="flex items-center space-x-2 mx-auto"
            >
              <span>Start Searching</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gray-50 rounded-2xl p-12">
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">Join the Grid</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get workspace tips, updates, and exclusive offers straight to your
              inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Button variant="primary" className="flex items-center space-x-2">
                <span>Subscribe Now</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
