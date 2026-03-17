import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-serif text-secondary-900 text-center mb-12">
          Admin Panel
        </h1>

        <div className="max-w-7xl mx-auto">
          {/* Dashboard Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="card text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-2">24</div>
              <div className="text-secondary-700">Today's Bookings</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-accent-600 mb-2">156</div>
              <div className="text-secondary-700">Total Students</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-2">8</div>
              <div className="text-secondary-700">Pending Approvals</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-accent-600 mb-2">₹12,500</div>
              <div className="text-secondary-700">Today's Revenue</div>
            </div>
          </div>

          {/* Admin Navigation */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Management */}
            <div className="card">
              <h2 className="text-xl font-serif text-secondary-900 mb-4">
                Calendar Management
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  📅 Manage Time Slots
                </button>
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  🔄 Update Availability
                </button>
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  📊 View Booking Analytics
                </button>
              </div>
            </div>

            {/* Content Management */}
            <div className="card">
              <h2 className="text-xl font-serif text-secondary-900 mb-4">
                Content Management
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  💬 Review Testimonials
                </button>
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  📧 Manage Inquiries
                </button>
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  📝 Update Practice Styles
                </button>
              </div>
            </div>

            {/* Financial Management */}
            <div className="card">
              <h2 className="text-xl font-serif text-secondary-900 mb-4">
                Financial Management
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  💰 Payment Overview
                </button>
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  📈 Revenue Reports
                </button>
                <button className="w-full text-left p-3 hover:bg-primary-100 rounded transition-colors">
                  🔄 Refund Management
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-12">
            <div className="card">
              <h2 className="text-xl font-serif text-secondary-900 mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded">
                  <div>
                    <div className="font-medium text-secondary-800">New booking from Sarah M.</div>
                    <div className="text-sm text-secondary-600">Hatha Yoga - Tomorrow 10:00 AM</div>
                  </div>
                  <div className="text-sm text-secondary-500">2 min ago</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded">
                  <div>
                    <div className="font-medium text-secondary-800">Testimonial submitted by Michael R.</div>
                    <div className="text-sm text-secondary-600">Pending approval</div>
                  </div>
                  <div className="text-sm text-secondary-500">15 min ago</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded">
                  <div>
                    <div className="font-medium text-secondary-800">Payment received - ₹500</div>
                    <div className="text-sm text-secondary-600">Booking ID: #BK001234</div>
                  </div>
                  <div className="text-sm text-secondary-500">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;