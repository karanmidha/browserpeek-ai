import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import { AdminAuthPage } from './pages/admin/AdminAuthPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCalendar } from './pages/admin/AdminCalendar';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminTestimonials } from './pages/admin/AdminTestimonials';
import { AdminInquiries } from './pages/admin/AdminInquiries';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/booking" element={<Layout><BookingPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/admin" element={<Layout><AdminPage /></Layout>} />

        {/* Admin authentication */}
        <Route path="/admin/auth" element={<AdminAuthPage />} />

        {/* Protected admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          {/* Additional admin routes will be added here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;