import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { contactSchema, validateInput, type ContactInput } from '../lib/validations';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactInput>({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors([]);

    // Client-side validation
    const validation = validateInput(contactSchema, formData);
    if (!validation.success) {
      setFormErrors(validation.errors);
      setSubmitting(false);
      return;
    }

    try {
      // Submit contact inquiry
      const { error } = await supabase
        .from('contact_inquiries')
        .insert([{
          name: validation.data.name,
          email: validation.data.email,
          phone: validation.data.phone || null,
          subject: validation.data.subject,
          message: validation.data.message,
          status: 'new',
          priority: 'medium'
        }] as any);

      if (error) throw error;

      // Success feedback
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      setFormErrors([error.message || 'Failed to send message. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-cream-50 text-stone-800">
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-stone-900">Get in Touch</h1>
          <p className="text-sage-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Have questions about our yoga practices or want to book a private session? We'd love to hear from you.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Inquiry Form */}
          <section className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 md:p-10">
            <h2 className="text-3xl font-normal text-stone-900 mb-8">Send Inquiry</h2>

              {/* Success Message */}
              {submitSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <p className="font-medium">Thank you for your message!</p>
                  <p className="text-sm">We'll get back to you within 24 hours.</p>
                </div>
              )}

              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-stone-200 bg-cream-50 px-4 py-3 text-stone-900 focus:ring-2 focus:ring-sage-600 focus:border-sage-600"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>

                {/* Email Address */}
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-stone-200 bg-cream-50 px-4 py-3 text-stone-900 focus:ring-2 focus:ring-sage-600 focus:border-sage-600"
                    inputMode="email"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Phone Number (keeping as optional) */}
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest" htmlFor="phone">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-stone-200 bg-cream-50 px-4 py-3 text-stone-900 focus:ring-2 focus:ring-sage-600 focus:border-sage-600"
                    inputMode="tel"
                    pattern="[0-9]*"
                    placeholder="+1 (555) 123-4567"
                    autoComplete="tel"
                  />
                </div>

                {/* Subject Selection */}
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest" htmlFor="subject">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-stone-200 bg-cream-50 px-4 py-3 text-stone-900 focus:ring-2 focus:ring-sage-600 focus:border-sage-600"
                    required
                  >
                    <option disabled value="">Please select an option</option>
                    <option value="personal">Personal Session</option>
                    <option value="corporate">Corporate Workshop</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                {/* Message Area */}
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-stone-200 bg-cream-50 px-4 py-3 text-stone-900 focus:ring-2 focus:ring-sage-600 focus:border-sage-600"
                    rows={5}
                    placeholder="How can we assist you?"
                    required
                    maxLength={2000}
                  />
                  <div className="text-xs text-stone-500 mt-1">
                    {formData.message.length}/2000 characters
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-wood-500 hover:bg-wood-700 text-white py-4 px-6 rounded-lg font-bold uppercase tracking-widest transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>

                <div className="text-xs text-stone-500 text-center mt-4">
                  <p>We respect your privacy and will never share your information.</p>
                </div>
              </form>
            </div>

            {/* Contact Details Sidebar */}
            <aside className="space-y-12 lg:pl-8">
              {/* Direct Contact Info */}
              <section>
                <h2 className="text-3xl font-normal text-stone-900 mb-8">Contact Details</h2>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-6 w-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Email Us</p>
                      <p className="mt-1 text-lg text-sage-800">hello@omyogvidya.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-6 w-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Call Us</p>
                      <p className="mt-1 text-lg text-sage-800">+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-6 w-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Visit Us</p>
                      <p className="mt-1 text-lg text-sage-800">
                        Mumbai, Maharashtra<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Session Hours */}
              <section className="bg-cream-100 rounded-2xl p-8">
                <h3 className="text-xl font-medium text-stone-900 mb-6">Session Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Monday - Friday</span>
                    <span className="text-stone-900 font-medium">6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Saturday</span>
                    <span className="text-stone-900 font-medium">7:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Sunday</span>
                    <span className="text-stone-900 font-medium">8:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </section>

              {/* Response Time */}
              <section>
                <h3 className="text-xl font-medium text-stone-900 mb-4">Response Time</h3>
                <p className="text-stone-600">
                  We typically respond to all inquiries within 24 hours during business days.
                  For urgent booking questions, please call us directly.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;