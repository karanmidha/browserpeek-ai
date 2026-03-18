import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { adminAuth } from '../../lib/admin/auth';
import {
  BookOpen,
  Search,
  Download,
  Eye,
  X,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  time_slot_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id: string | null;
  amount: number;
  currency: string;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    phone: string | null;
  };
  users?: {
    email: string;
  };
  time_slots?: {
    date: string;
    start_time: string;
    end_time: string;
    practice_styles?: {
      name: string;
    };
  };
  payments?: {
    razorpay_payment_id: string;
    status: string;
    payment_method: string | null;
  }[];
}

interface FilterState {
  status: string;
  payment_status: string;
  date_from: string;
  date_to: string;
  search: string;
}

const StatusBadge: React.FC<{ status: string; type: 'booking' | 'payment' }> = ({ status, type }) => {
  const getStatusConfig = () => {
    if (type === 'booking') {
      switch (status) {
        case 'confirmed':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
        case 'cancelled':
          return { color: 'bg-red-100 text-red-800', icon: XCircle };
        case 'completed':
          return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
      }
    } else {
      switch (status) {
        case 'paid':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
        case 'failed':
          return { color: 'bg-red-100 text-red-800', icon: XCircle };
        case 'refunded':
          return { color: 'bg-purple-100 text-purple-800', icon: RefreshCw };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
      }
    }
  };

  const { color, icon: Icon } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} className="mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    payment_status: '',
    date_from: '',
    date_to: '',
    search: '',
  });

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user_profiles(first_name, last_name, phone),
          users(email),
          time_slots(
            date,
            start_time,
            end_time,
            practice_styles(name)
          ),
          payments(
            razorpay_payment_id,
            status,
            payment_method
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Filter by payment status
    if (filters.payment_status) {
      filtered = filtered.filter(booking => booking.payment_status === filters.payment_status);
    }

    // Filter by date range
    if (filters.date_from) {
      filtered = filtered.filter(booking =>
        booking.time_slots && booking.time_slots.date >= filters.date_from
      );
    }
    if (filters.date_to) {
      filtered = filtered.filter(booking =>
        booking.time_slots && booking.time_slots.date <= filters.date_to
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking => {
        const customerName = `${booking.user_profiles?.first_name || ''} ${booking.user_profiles?.last_name || ''}`.toLowerCase();
        const email = booking.users?.email?.toLowerCase() || '';
        const practiceStyle = booking.time_slots?.practice_styles?.name?.toLowerCase() || '';

        return customerName.includes(searchLower) ||
               email.includes(searchLower) ||
               practiceStyle.includes(searchLower);
      });
    }

    setFilteredBookings(filtered);
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change this booking status to ${newStatus}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('booking.status_update', bookingId, 'bookings', { new_status: newStatus });

      await loadBookings();
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleRefundPayment = async (bookingId: string) => {
    if (!confirm('Are you sure you want to process a refund for this booking? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real implementation, this would call RazorPay refund API
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('booking.refund', bookingId, 'bookings');

      await loadBookings();
      alert('Refund processed successfully');
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert('Failed to process refund');
    }
  };

  const logAuditAction = async (action: string, targetId: string | null, targetType: string, data?: any) => {
    try {
      await supabase.from('audit_logs').insert({
        admin_id: adminAuth.getCurrentSession()?.user.id || '',
        action,
        target_id: targetId,
        target_type: targetType,
        new_value: data || null,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const getClientIP = async (): Promise<string | null> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  };

  const exportBookings = async () => {
    try {
      const csvContent = generateCSVContent(filteredBookings);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log export action
      await logAuditAction('bookings.export', null, 'bookings', {
        record_count: filteredBookings.length
      });
    } catch (error) {
      console.error('Failed to export bookings:', error);
      alert('Failed to export bookings');
    }
  };

  const generateCSVContent = (bookings: Booking[]): string => {
    const headers = [
      'Booking ID',
      'Customer Name',
      'Email',
      'Phone',
      'Class Date',
      'Class Time',
      'Practice Style',
      'Amount',
      'Booking Status',
      'Payment Status',
      'Payment ID',
      'Created At',
      'Special Requests'
    ];

    const rows = bookings.map(booking => [
      booking.id,
      `${booking.user_profiles?.first_name || ''} ${booking.user_profiles?.last_name || ''}`.trim(),
      booking.users?.email || '',
      booking.user_profiles?.phone || '',
      booking.time_slots?.date || '',
      `${booking.time_slots?.start_time || ''} - ${booking.time_slots?.end_time || ''}`,
      booking.time_slots?.practice_styles?.name || '',
      `₹${(booking.amount / 100).toFixed(2)}`,
      booking.status,
      booking.payment_status,
      booking.payments?.[0]?.razorpay_payment_id || '',
      new Date(booking.created_at).toLocaleString(),
      booking.special_requests || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">View and manage all class bookings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportBookings}
            className="flex items-center px-4 py-2 text-forest-green border border-forest-green rounded-lg hover:bg-forest-green hover:text-white transition-colors"
          >
            <Download size={20} className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={loadBookings}
            className="flex items-center px-4 py-2 bg-forest-green text-white rounded-lg hover:bg-forest-green/90 transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Customer, email, practice..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="">All Payment States</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h3>
            {filteredBookings.length > 0 && (
              <div className="text-sm text-gray-600">
                Total Revenue: ₹{filteredBookings
                  .filter(b => b.payment_status === 'paid')
                  .reduce((sum, b) => sum + b.amount, 0) / 100}
              </div>
            )}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user_profiles?.first_name} {booking.user_profiles?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{booking.users?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.time_slots?.practice_styles?.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {booking.time_slots?.date}
                          <Clock size={14} className="ml-2 mr-1" />
                          {booking.time_slots?.start_time}-{booking.time_slots?.end_time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(booking.amount / 100).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <StatusBadge status={booking.status} type="booking" />
                        <StatusBadge status={booking.payment_status} type="payment" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="text-forest-green hover:text-forest-green/80 mr-3"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Information */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.user_profiles?.first_name} {selectedBooking.user_profiles?.last_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">{selectedBooking.users?.email}</div>
                    </div>
                  </div>
                  {selectedBooking.user_profiles?.phone && (
                    <div className="flex items-center">
                      <Phone size={18} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">{selectedBooking.user_profiles.phone}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Class Information */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Class Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <BookOpen size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedBooking.time_slots?.practice_styles?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">{selectedBooking.time_slots?.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">
                        {selectedBooking.time_slots?.start_time} - {selectedBooking.time_slots?.end_time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(selectedBooking.amount / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Status</h4>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                    <StatusBadge status={selectedBooking.status} type="booking" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <StatusBadge status={selectedBooking.payment_status} type="payment" />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Special Requests</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}

              {/* Payment Information */}
              {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment ID:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {selectedBooking.payments[0].razorpay_payment_id}
                      </span>
                    </div>
                    {selectedBooking.payments[0].payment_method && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Method:</span>
                        <span className="text-sm text-gray-900">
                          {selectedBooking.payments[0].payment_method}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {selectedBooking.payment_status === 'paid' && selectedBooking.status !== 'completed' && (
                    <button
                      onClick={() => handleRefundPayment(selectedBooking.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Process Refund
                    </button>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'completed')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};