import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { adminAuth } from '../../lib/admin/auth';
import {
  Mail,
  Search,
  RefreshCw,
  Eye,
  X,
  Calendar,
  User,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  Reply,
  Trash2,
} from 'lucide-react';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  submitted_at: string;
  resolved_at: string | null;
}

interface FilterState {
  status: string;
  priority: string;
  search: string;
  date_from: string;
  date_to: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'new':
        return { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle };
      case 'in_progress':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'resolved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  const { color, icon: Icon } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} className="mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800' };
      case 'low':
        return { color: 'bg-gray-100 text-gray-800' };
      default:
        return { color: 'bg-gray-100 text-gray-800' };
    }
  };

  const { color } = getPriorityConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    priority: '',
    search: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadInquiries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inquiries, filters]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inquiries];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(inquiry => inquiry.status === filters.status);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(inquiry => inquiry.priority === filters.priority);
    }

    // Filter by date range
    if (filters.date_from) {
      filtered = filtered.filter(inquiry =>
        inquiry.submitted_at >= filters.date_from
      );
    }
    if (filters.date_to) {
      filtered = filtered.filter(inquiry =>
        inquiry.submitted_at <= filters.date_to + 'T23:59:59'
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchLower) ||
        inquiry.email.toLowerCase().includes(searchLower) ||
        inquiry.subject.toLowerCase().includes(searchLower) ||
        inquiry.message.toLowerCase().includes(searchLower)
      );
    }

    setFilteredInquiries(filtered);
  };

  const handleUpdateStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        assigned_to: adminAuth.getCurrentSession()?.user.id || '',
      };

      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_inquiries')
        .update(updateData)
        .eq('id', inquiryId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('inquiry.status_update', inquiryId, 'contact_inquiries', { new_status: newStatus });

      await loadInquiries();
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      alert('Failed to update inquiry status');
    }
  };

  const handleUpdatePriority = async (inquiryId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ priority: newPriority })
        .eq('id', inquiryId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('inquiry.priority_update', inquiryId, 'contact_inquiries', { new_priority: newPriority });

      await loadInquiries();
    } catch (error) {
      console.error('Failed to update inquiry priority:', error);
      alert('Failed to update inquiry priority');
    }
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      // In a real implementation, this would integrate with an email service
      // For now, we'll just mark as replied and log the action

      await handleUpdateStatus(selectedInquiry.id, 'in_progress');

      // Log the reply in audit logs
      await logAuditAction('inquiry.reply', selectedInquiry.id, 'contact_inquiries', {
        reply_message: replyMessage,
        recipient_email: selectedInquiry.email
      });

      setShowReplyModal(false);
      setReplyMessage('');
      alert(`Reply sent to ${selectedInquiry.email}`);
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to permanently delete this inquiry? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('inquiry.delete', inquiryId, 'contact_inquiries');

      await loadInquiries();
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      alert('Failed to delete inquiry');
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
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
          <p className="text-gray-600 mt-1">Handle customer inquiries and support requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadInquiries}
            className="flex items-center px-4 py-2 bg-forest-green text-white rounded-lg hover:bg-forest-green/90 transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'new').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter(i => i.priority === 'high').length}
              </p>
            </div>
          </div>
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
                placeholder="Name, email, subject..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Inquiries ({filteredInquiries.length})
          </h3>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <Mail size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail size={14} className="mr-1" />
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone size={14} className="mr-1" />
                            {inquiry.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{inquiry.subject}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{inquiry.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={inquiry.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={inquiry.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(inquiry.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowDetailsModal(true);
                          }}
                          className="text-forest-green hover:text-forest-green/80"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowReplyModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Reply"
                        >
                          <Reply size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Inquiry Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{selectedInquiry.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">{selectedInquiry.email}</div>
                    </div>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center">
                      <Phone size={18} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">{selectedInquiry.phone}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar size={18} className="text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">
                        {new Date(selectedInquiry.submitted_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Inquiry Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <div className="mt-1 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Status Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => handleUpdateStatus(selectedInquiry.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={selectedInquiry.priority}
                      onChange={(e) => handleUpdatePriority(selectedInquiry.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowReplyModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Reply to {selectedInquiry.name}</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <p className="text-sm text-gray-900">{selectedInquiry.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-sm text-gray-900">Re: {selectedInquiry.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                  placeholder="Type your reply..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyMessage.trim()}
                className="px-4 py-2 bg-forest-green text-white hover:bg-forest-green/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};