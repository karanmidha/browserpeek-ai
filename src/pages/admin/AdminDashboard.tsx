import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import {
  Calendar,
  BookOpen,
  MessageSquare,
  Mail,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  Star,
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingTestimonials: number;
  newInquiries: number;
  totalUsers: number;
  weeklyBookings: number;
  upcomingSlots: number;
  avgRating: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'testimonial' | 'inquiry' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
}> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'booking':
        return <BookOpen size={16} className="text-blue-600" />;
      case 'testimonial':
        return <MessageSquare size={16} className="text-purple-600" />;
      case 'inquiry':
        return <Mail size={16} className="text-orange-600" />;
      case 'payment':
        return <DollarSign size={16} className="text-green-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-sm text-gray-500 truncate">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{formatTimestamp(activity.timestamp)}</p>
      </div>
      {activity.status && (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            activity.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : activity.status === 'confirmed'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {activity.status}
        </span>
      )}
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const [
        bookingsResult,
        revenueResult,
        testimonialsResult,
        inquiriesResult,
        usersResult,
      ] = await Promise.all([
        loadBookingStats(),
        loadRevenueStats(),
        loadTestimonialStats(),
        loadInquiryStats(),
        loadUserStats(),
      ]);

      setStats({
        totalBookings: bookingsResult.total,
        todayBookings: bookingsResult.today,
        weeklyBookings: bookingsResult.weekly,
        upcomingSlots: bookingsResult.upcoming,
        weekRevenue: revenueResult.week,
        monthRevenue: revenueResult.month,
        pendingTestimonials: testimonialsResult.pending,
        avgRating: testimonialsResult.avgRating,
        newInquiries: inquiriesResult.new,
        totalUsers: usersResult.total,
      });

      // Load recent activity
      await loadRecentActivity();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalResult, todayResult, weeklyResult, upcomingResult] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact' }),
      supabase.from('bookings')
        .select('id', { count: 'exact' })
        .gte('created_at', today),
      supabase.from('bookings')
        .select('id', { count: 'exact' })
        .gte('created_at', weekAgo),
      supabase.from('time_slots')
        .select('id', { count: 'exact' })
        .eq('is_available', true)
        .gte('date', today),
    ]);

    return {
      total: totalResult.count || 0,
      today: todayResult.count || 0,
      weekly: weeklyResult.count || 0,
      upcoming: upcomingResult.count || 0,
    };
  };

  const loadRevenueStats = async () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [weekResult, monthResult] = await Promise.all([
      supabase.from('payments')
        .select('amount')
        .eq('status', 'captured')
        .gte('created_at', weekAgo),
      supabase.from('payments')
        .select('amount')
        .eq('status', 'captured')
        .gte('created_at', monthAgo),
    ]);

    return {
      week: weekResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
      month: monthResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
    };
  };

  const loadTestimonialStats = async () => {
    const [pendingResult, approvedResult] = await Promise.all([
      supabase.from('testimonials')
        .select('id', { count: 'exact' })
        .eq('status', 'pending'),
      supabase.from('testimonials')
        .select('rating')
        .eq('status', 'approved'),
    ]);

    const avgRating = approvedResult.data?.length
      ? approvedResult.data.reduce((sum, t) => sum + t.rating, 0) / approvedResult.data.length
      : 0;

    return {
      pending: pendingResult.count || 0,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  };

  const loadInquiryStats = async () => {
    const result = await supabase.from('contact_inquiries')
      .select('id', { count: 'exact' })
      .eq('status', 'new');

    return { new: result.count || 0 };
  };

  const loadUserStats = async () => {
    const result = await supabase.from('users')
      .select('id', { count: 'exact' });

    return { total: result.count || 0 };
  };

  const loadRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Recent bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id, created_at, status,
          user_profiles(first_name, last_name),
          time_slots(date, start_time)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      bookings?.forEach((booking) => {
        activities.push({
          id: booking.id,
          type: 'booking',
          title: 'New Booking',
          description: `${booking.user_profiles?.first_name} ${booking.user_profiles?.last_name} booked for ${booking.time_slots?.date}`,
          timestamp: booking.created_at,
          status: booking.status,
        });
      });

      // Recent testimonials
      const { data: testimonials } = await supabase
        .from('testimonials')
        .select('id, name, submitted_at, status')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(2);

      testimonials?.forEach((testimonial) => {
        activities.push({
          id: testimonial.id,
          type: 'testimonial',
          title: 'New Testimonial',
          description: `${testimonial.name} submitted a testimonial`,
          timestamp: testimonial.submitted_at,
          status: testimonial.status,
        });
      });

      // Recent inquiries
      const { data: inquiries } = await supabase
        .from('contact_inquiries')
        .select('id, name, subject, submitted_at, status')
        .eq('status', 'new')
        .order('submitted_at', { ascending: false })
        .limit(2);

      inquiries?.forEach((inquiry) => {
        activities.push({
          id: inquiry.id,
          type: 'inquiry',
          title: 'New Inquiry',
          description: `${inquiry.name} asked about "${inquiry.subject}"`,
          timestamp: inquiry.submitted_at,
          status: inquiry.status,
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 8));
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your yoga studio.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Bookings"
            value={stats.todayBookings}
            change={`+${stats.weeklyBookings} this week`}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={BookOpen}
            color="green"
          />
          <StatCard
            title="Week Revenue"
            value={`₹${(stats.weekRevenue / 100).toLocaleString()}`}
            change={`₹${(stats.monthRevenue / 100).toLocaleString()} this month`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Upcoming Slots"
            value={stats.upcomingSlots}
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Pending Reviews"
            value={stats.pendingTestimonials}
            icon={MessageSquare}
            color="purple"
          />
          <StatCard
            title="New Inquiries"
            value={stats.newInquiries}
            icon={Mail}
            color="orange"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Average Rating"
            value={stats.avgRating > 0 ? `${stats.avgRating}/5` : 'No ratings'}
            icon={Star}
            color="purple"
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest bookings, testimonials, and inquiries</p>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Common administrative tasks</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Calendar size={20} className="text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">Add Time Slots</div>
                  <div className="text-sm text-blue-700">Create new available slots</div>
                </div>
              </button>
              <button className="w-full flex items-center p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <MessageSquare size={20} className="text-purple-600 mr-3" />
                <div>
                  <div className="font-medium text-purple-900">Review Testimonials</div>
                  <div className="text-sm text-purple-700">{stats?.pendingTestimonials} pending approval</div>
                </div>
              </button>
              <button className="w-full flex items-center p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <Mail size={20} className="text-orange-600 mr-3" />
                <div>
                  <div className="font-medium text-orange-900">Handle Inquiries</div>
                  <div className="text-sm text-orange-700">{stats?.newInquiries} new messages</div>
                </div>
              </button>
              <button className="w-full flex items-center p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <BookOpen size={20} className="text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-green-900">Export Reports</div>
                  <div className="text-sm text-green-700">Download booking and revenue data</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};