import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 bg-primary-100">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif text-secondary-900 text-center mb-12">
          Contact Us
        </h1>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <h2 className="text-2xl font-serif text-secondary-900 mb-6">
                Send us a Message
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
                      Email Address *
                    </label>
                    <input type="email" className="input" required />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Phone Number (Optional)
                  </label>
                  <input type="tel" className="input" />
                </div>

                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Subject *
                  </label>
                  <select className="input" required>
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="booking">Booking Question</option>
                    <option value="private">Private Sessions</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    className="input"
                    rows={6}
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                <div className="text-center">
                  <button type="submit" className="btn-primary px-8 py-3">
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="card">
                <h3 className="text-xl font-serif text-secondary-900 mb-4">
                  Get in Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-accent-600 mt-1">📧</div>
                    <div>
                      <div className="font-medium text-secondary-800">Email</div>
                      <div className="text-secondary-700">info@omyogvidya.com</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-accent-600 mt-1">📞</div>
                    <div>
                      <div className="font-medium text-secondary-800">Phone</div>
                      <div className="text-secondary-700">+91 98765 43210</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-accent-600 mt-1">📍</div>
                    <div>
                      <div className="font-medium text-secondary-800">Location</div>
                      <div className="text-secondary-700">
                        Mumbai, Maharashtra<br />
                        India
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-serif text-secondary-900 mb-4">
                  Session Hours
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-secondary-800">Monday - Friday</span>
                    <span className="text-secondary-700">6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-800">Saturday</span>
                    <span className="text-secondary-700">7:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-800">Sunday</span>
                    <span className="text-secondary-700">8:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-serif text-secondary-900 mb-4">
                  Response Time
                </h3>
                <p className="text-secondary-700">
                  We typically respond to all inquiries within 24 hours.
                  For urgent booking questions, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;