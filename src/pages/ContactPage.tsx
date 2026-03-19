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

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-secondary-800 font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-secondary-800 font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input"
                      inputMode="email"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                    inputMode="tel"
                    pattern="[0-9]*"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="classes">Class Questions</option>
                    <option value="private">Private Sessions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-secondary-800 font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="input"
                    rows={6}
                    placeholder="How can we help you?"
                    required
                    maxLength={2000}
                  />
                  <div className="text-sm text-secondary-600 mt-1">
                    {formData.message.length}/2000 characters
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

                <div className="text-sm text-secondary-600 text-center">
                  <p>We respect your privacy and will never share your information.</p>
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