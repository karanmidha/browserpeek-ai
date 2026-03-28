import React, { useState, useEffect, useRef, useCallback } from 'react';

const HomePage: React.FC = () => {
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [stats, setStats] = useState({ students: 0, experience: 0, sessions: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const finalStats = { students: 500, experience: 15, sessions: 1000 };

  const animateStats = useCallback(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    for (let step = 0; step <= steps; step++) {
      setTimeout(() => {
        const progress = step / steps;
        setStats({
          students: Math.round(finalStats.students * progress),
          experience: Math.round(finalStats.experience * progress),
          sessions: Math.round(finalStats.sessions * progress),
        });
      }, step * stepDuration);
    }
  }, [finalStats.students, finalStats.experience, finalStats.sessions]);

  // Screen size detection for carousel behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 2200);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          animateStats();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsAnimated, animateStats]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  const testimonials = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "Yoga Student",
      rating: 5,
      quote: "OmYogVidya has become my sanctuary. The gentle guidance and supportive community have helped me find balance.",
    },
    {
      id: 2,
      name: "David Miller",
      role: "New Student",
      rating: 4,
      quote: "The instructor's patient approach made me feel welcome. I've gained strength, flexibility, and inner peace.",
    },
    {
      id: 3,
      name: "Elena Kovac",
      role: "Vinyasa Student",
      rating: 5,
      quote: "The flowing sequences are pure poetry in motion. Each breath connects me deeper to myself.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-carousel.png"
            alt="Serene yoga session in a bright studio"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-sage-800/20"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl bg-cream-50/85 backdrop-blur-md p-8 sm:p-12 lg:p-16 border-l-4 border-wood-500 shadow-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-6 text-stone-900 leading-[1.1] tracking-tight">
              Find Your Flow, <br/>
              <span className="italic font-normal text-sage-600">Reconnect with Self</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-stone-700 mb-8 leading-relaxed max-w-lg">
              Experience a journey of mindfulness and physical well-being through professional guided yoga practices tailored for every level.
            </p>
            <a className="inline-block bg-wood-500 hover:bg-wood-700 text-white px-8 sm:px-10 py-3 sm:py-4 text-sm font-semibold uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-wood-500 focus:ring-offset-2" href="/booking">
              Begin Your Journey
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-cream-100" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              {/* Instructor Portrait */}
              <img
                alt="Yoga Instructor Portrait"
                className="w-full h-auto shadow-2xl rounded-lg"
                src="/instructor.png"
              />
              <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 w-32 h-32 lg:w-48 lg:h-48 bg-sage-200 rounded-lg -z-10"></div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-wood-500 font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-4 lg:mb-6 block">Meet Your Instructor</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6 lg:mb-8 text-stone-900 leading-tight">Guided by Grace, Grounded in Peace</h2>
              <p className="text-base sm:text-lg text-stone-600 mb-6 leading-relaxed">
                With over 10 years of experience in Hatha and Vinyasa yoga, I help students find balance both on and off the mat. My approach combines traditional techniques with modern mindfulness practices to help you build strength, flexibility, and inner calm.
              </p>
              <p className="text-base sm:text-lg text-stone-600 mb-8 lg:mb-10 leading-relaxed">
                Yoga is more than just movement; it's a conversation between the body, mind, and spirit. I am here to facilitate that dialogue and support your personal growth.
              </p>
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="h-px w-8 lg:w-12 bg-sage-600"></div>
                <span className="font-serif italic text-lg sm:text-xl lg:text-2xl text-sage-800">Elena Serene</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yoga Styles Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white" id="styles">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-12 lg:mb-16 text-stone-900 leading-tight">Practices for Every Body</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Style 1: Vinyasa */}
            <div className="group p-6 lg:p-8 border border-sage-100 hover:bg-sage-50 transition-all duration-300 rounded-lg hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-md">
                <img
                  alt="Vinyasa Flow"
                  className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  src="/vinyasa.png"
                />
              </div>
              <h3 className="text-xl sm:text-2xl mb-4 text-sage-800 font-semibold">Vinyasa Flow</h3>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">Dynamic sequences that synchronize breath with movement to build heat and focus.</p>
            </div>

            {/* Style 2: Yin Yoga */}
            <div className="group p-6 lg:p-8 border border-sage-100 hover:bg-sage-50 transition-all duration-300 rounded-lg hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-md">
                <img
                  alt="Yin Yoga"
                  className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  src="/yin.png"
                />
              </div>
              <h3 className="text-xl sm:text-2xl mb-4 text-sage-800 font-semibold">Yin Yoga</h3>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">Slow-paced practice targeting deep connective tissues through long-held passive poses.</p>
            </div>

            {/* Style 3: Pilates */}
            <div className="group p-6 lg:p-8 border border-sage-100 hover:bg-sage-50 transition-all duration-300 rounded-lg hover:shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="mb-6 overflow-hidden rounded-md">
                <img
                  alt="Pilates"
                  className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  src="/restorative.png"
                />
              </div>
              <h3 className="text-xl sm:text-2xl mb-4 text-sage-800 font-semibold">Pilates</h3>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">Strengthen your core and improve flexibility through controlled movements that enhance body awareness and alignment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Shared Journey - Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24 bg-cream-100" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6 lg:mb-8 text-stone-900 leading-tight">
              Our Shared Journey
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Read the stories of transformation and peace from our community. Every breath counts, and every journey is unique.
            </p>
          </div>

          {/* Testimonials Grid/Carousel */}
          {isLargeScreen ? (
            // Large screen grid (>2200px) - 3 columns
            <div className="grid grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-6 border border-sage-100 hover:shadow-lg transition-shadow duration-300">
                  {/* Header with Name and Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-stone-900 font-semibold text-lg">
                        {testimonial.name}
                      </h3>
                      <p className="text-stone-600 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="text-wood-500 text-lg">
                      {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-stone-600 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            // Smaller screens (≤2200px) - Carousel
            <div className="relative">
              {/* Mobile: Single card, Tablet+: Multiple cards */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                      <div className="bg-white p-6 border border-sage-100 hover:shadow-lg transition-shadow duration-300 mx-auto max-w-md">
                        {/* Header with Name and Rating */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-stone-900 font-semibold text-lg">
                              {testimonial.name}
                            </h3>
                            <p className="text-stone-600 text-sm">
                              {testimonial.role}
                            </p>
                          </div>
                          <div className="text-wood-500 text-lg">
                            {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                          </div>
                        </div>

                        {/* Quote */}
                        <p className="text-stone-600 italic leading-relaxed">
                          "{testimonial.quote}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white border border-sage-200 rounded-full w-12 h-12 flex items-center justify-center text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white border border-sage-200 rounded-full w-12 h-12 flex items-center justify-center text-sage-600 hover:bg-sage-50 hover:text-sage-800 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dot indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 ${
                      currentTestimonial === index
                        ? 'bg-sage-600'
                        : 'bg-sage-200 hover:bg-sage-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* CTA Banner - H-05: Optimized typography and responsive design */}
      <section className="py-16 sm:py-20 lg:py-24 bg-secondary-800 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif text-white mb-6 lg:mb-8 leading-[1.1]">
            Ready to Transform
            <span className="block text-accent-200 mt-2">Your Life?</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-secondary-100 mb-10 lg:mb-12 max-w-4xl mx-auto leading-relaxed">
            Take the first step toward better health, inner peace, and spiritual growth.
            Your yoga journey begins with a single breath.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8">
            <a href="/booking" className="btn-secondary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 hover:bg-accent-600 hover:scale-105 transform transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-secondary-800 min-h-[44px]">
              Book a Session
            </a>
            <a href="/contact" className="border-2 border-white text-white text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-md hover:bg-white hover:text-secondary-600 transition-all duration-300 hover:scale-105 transform min-h-[44px] inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-secondary-800">
              Contact Us
            </a>
          </div>
          <div ref={statsRef} className="mt-12 lg:mt-16 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 lg:gap-16 text-secondary-200">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2 font-medium">{stats.students}+</div>
              <div className="text-sm sm:text-base uppercase tracking-wider">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2 font-medium">{stats.experience}+</div>
              <div className="text-sm sm:text-base uppercase tracking-wider">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2 font-medium">{stats.sessions}+</div>
              <div className="text-sm sm:text-base uppercase tracking-wider">Sessions Taught</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;