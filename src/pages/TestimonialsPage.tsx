import React from 'react';

const TestimonialsPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 bg-white">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif text-secondary-900 text-center mb-12">
          Student Testimonials
        </h1>

        {/* Featured Testimonials */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder testimonials */}
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="text-accent-500">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-secondary-700 mb-4 italic">
                "The yoga sessions have transformed my daily routine. I feel more centered and peaceful."
              </p>
              <div className="text-secondary-900 font-medium">— Sarah M.</div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="text-accent-500">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-secondary-700 mb-4 italic">
                "Excellent instruction and a welcoming atmosphere. Highly recommend for beginners."
              </p>
              <div className="text-secondary-900 font-medium">— Michael R.</div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="text-accent-500">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-secondary-700 mb-4 italic">
                "The meditation practices have helped me manage stress better than I ever imagined."
              </p>
              <div className="text-secondary-900 font-medium">— Priya K.</div>
            </div>
          </div>
        </div>

        {/* Add Testimonial Form */}
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-serif text-secondary-900 mb-6 text-center">
              Share Your Experience
            </h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Your Name *
                  </label>
                  <input type="text" className="input" required />
                </div>
                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Email (Optional)
                  </label>
                  <input type="email" className="input" />
                </div>
              </div>

              <div>
                <label className="block text-secondary-800 font-medium mb-2">
                  Rating *
                </label>
                <select className="input" required>
                  <option value="">Select rating</option>
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Fair</option>
                  <option value="1">1 Star - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-secondary-800 font-medium mb-2">
                  Your Testimonial *
                </label>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="Share your experience with our yoga practice..."
                  required
                ></textarea>
              </div>

              <div className="text-center">
                <button type="submit" className="btn-primary px-8 py-3">
                  Submit Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;