import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-200 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-secondary-900 mb-6">
            OmYogVidya
          </h1>
          <p className="text-xl text-secondary-700 max-w-2xl mx-auto mb-8">
            Discover inner peace and physical wellness through authentic yoga practice
            with experienced instructors.
          </p>
          <button className="btn-primary text-lg px-8 py-4">
            Book Your Session
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif text-secondary-900 mb-8">
              About Our Practice
            </h2>
            <p className="text-lg text-secondary-700 leading-relaxed">
              Welcome to OmYogVidya, where ancient wisdom meets modern wellness.
              Our experienced instructors guide you through transformative yoga sessions
              designed to nurture both body and spirit.
            </p>
          </div>
        </div>
      </section>

      {/* Practice Styles Grid */}
      <section className="py-16 bg-primary-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-secondary-900 text-center mb-12">
            Practice Styles
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Placeholder for practice styles */}
            <div className="card text-center">
              <h3 className="text-xl font-serif text-secondary-900 mb-4">Hatha Yoga</h3>
              <p className="text-secondary-700">Gentle, slow-paced practice focusing on basic postures and breathing.</p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-serif text-secondary-900 mb-4">Vinyasa Flow</h3>
              <p className="text-secondary-700">Dynamic sequences that link movement with breath.</p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-serif text-secondary-900 mb-4">Meditation</h3>
              <p className="text-secondary-700">Mindfulness and meditation practices for inner peace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif text-white mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-secondary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have discovered the transformative power of yoga.
          </p>
          <button className="btn-secondary text-lg px-8 py-4">
            Schedule Your First Session
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;