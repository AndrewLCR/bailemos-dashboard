import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalClasses: 0,
    totalBookings: 0,
    totalPromotions: 0,
    activeUsers: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // In a real app, this would fetch from: GET /api/admin/analytics
    // For demo purposes, we'll use placeholder data
    setAnalytics({
      totalEvents: 0,
      totalClasses: 0,
      totalBookings: 0,
      totalPromotions: 0,
      activeUsers: 0,
      revenue: 0,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Platform Analytics</h1>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Events</p>
                <h3 className="text-4xl font-bold mt-1">{analytics.totalEvents}</h3>
              </div>
              <div className="text-5xl opacity-50">🎉</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Classes</p>
                <h3 className="text-4xl font-bold mt-1">{analytics.totalClasses}</h3>
              </div>
              <div className="text-5xl opacity-50">💃</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Bookings</p>
                <h3 className="text-4xl font-bold mt-1">{analytics.totalBookings}</h3>
              </div>
              <div className="text-5xl opacity-50">📚</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Promotions</p>
                <h3 className="text-3xl font-bold text-white mt-1">{analytics.totalPromotions}</h3>
              </div>
              <div className="text-4xl">🎁</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users (30d)</p>
                <h3 className="text-3xl font-bold text-white mt-1">{analytics.activeUsers}</h3>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue (MTD)</p>
                <h3 className="text-3xl font-bold text-white mt-1">${analytics.revenue}</h3>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-gray-300">
              <div className="text-2xl">📊</div>
              <div className="flex-1">
                <p className="text-sm">Platform activity will be shown here</p>
                <p className="text-xs text-gray-500">Real-time updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Admin Dashboard</h3>
              <p className="text-blue-200 text-sm">
                This dashboard provides an overview of platform activity. In a production environment, 
                this would include real-time analytics, user management tools, and content moderation features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
