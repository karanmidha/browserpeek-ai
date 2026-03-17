import React from 'react';

const BookingPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 bg-primary-100">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif text-secondary-900 text-center mb-12">
          Book Your Session
        </h1>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Calendar Section */}
            <div className="card">
              <h2 className="text-2xl font-serif text-secondary-900 mb-6">
                Select Date
              </h2>
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <p className="text-secondary-700">Calendar component will be implemented here</p>
              </div>
            </div>

            {/* Time Slots Section */}
            <div className="card">
              <h2 className="text-2xl font-serif text-secondary-900 mb-6">
                Available Time Slots
              </h2>
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <p className="text-secondary-700">Time slots will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="card mt-8">
            <h2 className="text-2xl font-serif text-secondary-900 mb-6">
              Session Details
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-secondary-800 font-medium mb-2">
                  Practice Style
                </label>
                <select className="input">
                  <option>Select a practice style</option>
                  <option>Hatha Yoga</option>
                  <option>Vinyasa Flow</option>
                  <option>Meditation</option>
                </select>
              </div>

              <div>
                <label className="block text-secondary-800 font-medium mb-2">
                  Special Requests (Optional)
                </label>
                <textarea className="input" rows={4} placeholder="Any specific needs or questions?"></textarea>
              </div>

              <div className="flex justify-between items-center pt-6">
                <div className="text-lg font-medium text-secondary-900">
                  Total: ₹500
                </div>
                <button type="submit" className="btn-primary px-8 py-3">
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;