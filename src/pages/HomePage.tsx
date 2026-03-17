import React, { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "The yoga sessions have transformed my life. I feel more balanced and peaceful than ever before.",
      name: "Sarah Johnson",
      rating: 5,
    },
    {
      id: 2,
      quote: "Amazing instructor and beautiful space. Every session leaves me feeling refreshed and centered.",
      name: "Michael Chen",
      rating: 5,
    },
    {
      id: 3,
      quote: "The personalized approach and attention to detail makes all the difference. Highly recommended!",
      name: "Emma Williams",
      rating: 5,
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-200 via-primary-100 to-accent-100 min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/hero.png"
            alt="Yoga instructor in peaceful meditation pose"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/60 via-secondary-800/40 to-transparent"></div>
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
              Find Your Inner
              <span className="block text-accent-200">Peace</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mb-8 leading-relaxed">
              Transform your body and mind through authentic yoga practice
              guided by experienced instructors in a serene, welcoming environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary text-lg px-8 py-4 hover:scale-105 transform transition-all duration-300">
                Book Your Session
              </button>
              <button className="btn-secondary text-lg px-8 py-4 hover:scale-105 transform transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Bio Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-4xl font-serif text-secondary-900 mb-6">
                  Meet Your Instructor
                </h2>
                <h3 className="text-2xl font-serif text-accent-500 mb-4">
                  Priya Sharma, RYT-500
                </h3>
                <p className="text-lg text-secondary-700 leading-relaxed mb-6">
                  With over 15 years of dedicated practice and teaching experience, Priya brings
                  a deep understanding of traditional yoga philosophy combined with modern wellness
                  approaches. Certified in multiple yoga disciplines including Hatha, Vinyasa,
                  and Yin Yoga.
                </p>
                <p className="text-lg text-secondary-700 leading-relaxed mb-8">
                  Her warm, encouraging teaching style creates a safe space for students of all
                  levels to explore their practice, find balance, and discover inner strength.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com/omyogvidya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-500 hover:text-accent-600 transition-colors duration-200"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com/omyogvidya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-500 hover:text-accent-600 transition-colors duration-200"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-accent-200 to-secondary-200 rounded-2xl transform rotate-3"></div>
                  <img
<<<<<<< HEAD
                    src="/src/assets/hero.png"
=======
                    src="/hero.png"
>>>>>>> origin/main
                    alt="Priya Sharma - Certified Yoga Instructor"
                    className="relative w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Styles Grid */}
      <section className="py-20 bg-primary-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif text-secondary-900 text-center mb-4">
            Practice Styles
          </h2>
          <p className="text-lg text-secondary-700 text-center mb-16 max-w-3xl mx-auto">
            Choose from our carefully curated yoga practices, each designed to meet you where you are
            and guide you toward your wellness goals.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group cursor-pointer">
              <div className="card hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors duration-300">
                    <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-secondary-900 mb-4 group-hover:text-secondary-700 transition-colors duration-300">Hatha Yoga</h3>
                </div>
                <p className="text-secondary-700 mb-6 leading-relaxed">
                  Gentle, slow-paced practice focusing on basic postures, breathing techniques,
                  and meditation. Perfect for beginners and those seeking relaxation.
                </p>
                <button className="btn-secondary w-full group-hover:bg-accent-600 transition-colors duration-300">
                  Book Hatha Session
                </button>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="card hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors duration-300">
                    <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-secondary-900 mb-4 group-hover:text-secondary-700 transition-colors duration-300">Vinyasa Flow</h3>
                </div>
                <p className="text-secondary-700 mb-6 leading-relaxed">
                  Dynamic sequences that link movement with breath, creating a flowing meditation.
                  Build strength, flexibility, and mindfulness through continuous movement.
                </p>
                <button className="btn-secondary w-full group-hover:bg-accent-600 transition-colors duration-300">
                  Book Flow Session
                </button>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="card hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors duration-300">
                    <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-secondary-900 mb-4 group-hover:text-secondary-700 transition-colors duration-300">Meditation & Mindfulness</h3>
                </div>
                <p className="text-secondary-700 mb-6 leading-relaxed">
                  Cultivate inner peace and mental clarity through guided meditation practices,
                  breathwork, and mindfulness techniques for modern life.
                </p>
                <button className="btn-secondary w-full group-hover:bg-accent-600 transition-colors duration-300">
                  Book Meditation Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif text-secondary-900 text-center mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-secondary-700 text-center mb-16 max-w-3xl mx-auto">
            Join hundreds of students who have discovered transformation through our yoga practice.
          </p>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="card text-center p-8 md:p-12 bg-gradient-to-br from-primary-50 to-accent-50">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-accent-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-secondary-800 font-serif italic mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <p className="text-lg font-semibold text-secondary-900">
                  {testimonials[currentTestimonial].name}
                </p>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'bg-accent-500 scale-125'
                        : 'bg-secondary-300 hover:bg-secondary-400'
                    }`}
                  />
                ))}
              </div>

              {/* Previous/Next Buttons */}
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group hidden md:block"
              >
                <svg className="w-6 h-6 text-secondary-600 group-hover:text-secondary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group hidden md:block"
              >
                <svg className="w-6 h-6 text-secondary-600 group-hover:text-secondary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-secondary-700 via-secondary-600 to-secondary-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="20" fill="url(#pattern)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
            Ready to Transform
            <span className="block text-accent-200">Your Life?</span>
          </h2>
          <p className="text-xl text-secondary-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Take the first step toward better health, inner peace, and spiritual growth.
            Your yoga journey begins with a single breath.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="btn-secondary text-lg px-10 py-4 hover:bg-accent-600 hover:scale-105 transform transition-all duration-300 shadow-lg">
              Book Your First Session
            </button>
            <button className="border-2 border-white text-white text-lg px-10 py-4 rounded-md hover:bg-white hover:text-secondary-600 transition-all duration-300 hover:scale-105 transform">
              Contact Us
            </button>
          </div>
          <div className="mt-12 flex justify-center items-center space-x-8 text-secondary-200">
            <div className="text-center">
              <div className="text-2xl font-serif mb-1">500+</div>
              <div className="text-sm">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif mb-1">15+</div>
              <div className="text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-serif mb-1">1000+</div>
              <div className="text-sm">Sessions Taught</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;