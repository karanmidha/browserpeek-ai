import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { adminAuth } from '../../lib/admin/auth';
import {
  MessageSquare,
  Star,
  Check,
  X,
  Edit,
  Eye,
  Search,
  RefreshCw,
  Award,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  email: string | null;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface FilterState {
  status: string;
  rating: string;
  featured: string;
  search: string;
}

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={`${
            index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string; featured?: boolean }> = ({ status, featured }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: Check };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: X };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  const { color, icon: Icon } = getStatusConfig();

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {featured && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Award size={12} className="mr-1" />
          Featured
        </span>
      )}
    </div>
  );
};

export const AdminTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    content: '',
    rating: 5,
    is_featured: false,
  });

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    rating: '',
    featured: '',
    search: '',
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [testimonials, filters]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...testimonials];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(testimonial => testimonial.status === filters.status);
    }

    // Filter by rating
    if (filters.rating) {
      const rating = parseInt(filters.rating);
      filtered = filtered.filter(testimonial => testimonial.rating === rating);
    }

    // Filter by featured status
    if (filters.featured) {
      const isFeatured = filters.featured === 'true';
      filtered = filtered.filter(testimonial => testimonial.is_featured === isFeatured);
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(testimonial =>
        testimonial.name.toLowerCase().includes(searchLower) ||
        testimonial.content.toLowerCase().includes(searchLower) ||
        testimonial.email?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTestimonials(filtered);
  };

  const handleApprove = async (testimonialId: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminAuth.getCurrentSession()?.user.id || '',
        })
        .eq('id', testimonialId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('testimonial.approve', testimonialId, 'testimonials');

      await loadTestimonials();
    } catch (error) {
      console.error('Failed to approve testimonial:', error);
      alert('Failed to approve testimonial');
    }
  };

  const handleReject = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to reject this testimonial? This action can be reversed.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminAuth.getCurrentSession()?.user.id || '',
        })
        .eq('id', testimonialId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('testimonial.reject', testimonialId, 'testimonials');

      await loadTestimonials();
    } catch (error) {
      console.error('Failed to reject testimonial:', error);
      alert('Failed to reject testimonial');
    }
  };

  const handleToggleFeatured = async (testimonialId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          is_featured: !currentFeatured,
        })
        .eq('id', testimonialId);

      if (error) throw error;

      // Log audit action
      await logAuditAction(
        currentFeatured ? 'testimonial.unfeature' : 'testimonial.feature',
        testimonialId,
        'testimonials'
      );

      await loadTestimonials();
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setEditForm({
      content: testimonial.content,
      rating: testimonial.rating,
      is_featured: testimonial.is_featured,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTestimonial) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          content: editForm.content,
          rating: editForm.rating,
          is_featured: editForm.is_featured,
        })
        .eq('id', selectedTestimonial.id);

      if (error) throw error;

      // Log audit action
      await logAuditAction('testimonial.edit', selectedTestimonial.id, 'testimonials', editForm);

      setShowEditModal(false);
      await loadTestimonials();
    } catch (error) {
      console.error('Failed to update testimonial:', error);
      alert('Failed to update testimonial');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to permanently delete this testimonial? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) throw error;

      // Log audit action
      await logAuditAction('testimonial.delete', testimonialId, 'testimonials');

      await loadTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      alert('Failed to delete testimonial');
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
          <h1 className="text-2xl font-bold text-gray-900">Testimonial Moderation</h1>
          <p className="text-gray-600 mt-1">Review and manage customer testimonials</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTestimonials}
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
            <div className="p-3 rounded-lg bg-yellow-100">
              <MessageSquare className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {testimonials.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {testimonials.filter(t => t.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">
                {testimonials.filter(t => t.is_featured).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {testimonials.length > 0
                  ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Name, content, email..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <select
              value={filters.featured}
              onChange={(e) => setFilters({ ...filters, featured: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
            >
              <option value="">All Testimonials</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Testimonials ({filteredTestimonials.length})
          </h3>
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                      {testimonial.email && (
                        <p className="text-sm text-gray-500">{testimonial.email}</p>
                      )}
                      <div className="mt-1">
                        <StarRating rating={testimonial.rating} />
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={testimonial.status} featured={testimonial.is_featured} />
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(testimonial.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                      {testimonial.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTestimonial(testimonial);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-forest-green rounded-lg hover:bg-gray-100 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {testimonial.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReject(testimonial.id)}
                            className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(testimonial.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                        </>
                      )}
                      {testimonial.status === 'approved' && (
                        <button
                          onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                          className={`px-3 py-1 rounded transition-colors ${
                            testimonial.is_featured
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'text-purple-600 border border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Testimonial Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTestimonial.name}</p>
                  </div>
                  {selectedTestimonial.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTestimonial.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="mt-1">
                      <StarRating rating={selectedTestimonial.rating} size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={selectedTestimonial.status} featured={selectedTestimonial.is_featured} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial Content</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 leading-relaxed">{selectedTestimonial.content}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Review Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedTestimonial.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedTestimonial.reviewed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reviewed At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedTestimonial.reviewed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Testimonial</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-green focus:border-transparent"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_featured}
                    onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-forest-green focus:ring-forest-green"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured testimonial</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-forest-green text-white hover:bg-forest-green/90 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};