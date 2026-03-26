import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-50 text-stone-800">
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-stone-900">Get in Touch</h1>
          <p className="text-sage-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Have questions about our yoga practices or want to book a private session? We'd love to hear from you.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-16">
          <section className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 md:p-10">
            <h2 className="text-3xl font-normal text-stone-900 mb-8">Send Inquiry</h2>
            <p>Form will be here</p>
          </section>

          <aside className="space-y-12 lg:pl-8">
            <section>
              <h2 className="text-3xl font-normal text-stone-900 mb-8">Contact Details</h2>
              <p>Contact details will be here</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;