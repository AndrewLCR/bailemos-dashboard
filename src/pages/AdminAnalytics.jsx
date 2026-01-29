import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';

const AdminAnalytics = () => {
  const { t } = useTranslation();
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
        <h1 className="text-3xl font-bold text-white mb-6">{t('adminAnalytics.title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{t('adminAnalytics.totalEvents')}</p>
                <h3 className="text-4xl font-bold mt-1">{analytics.totalEvents}</h3>
              </div>
              <div className="text-5xl opacity-50">🎉</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{t('adminAnalytics.totalClasses')}</p>
                <h3 className="text-4xl font-bold mt-1">{analytics.totalClasses}</h3>
              </div>
              <div className="text-5xl opacity-50">💃</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{t('adminAnalytics.totalBookings')}</p>
                <h3 className="text-4xl font-bold mt-1">{analytics.totalBookings}</h3>
              </div>
              <div className="text-5xl opacity-50">📚</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('adminAnalytics.promotions')}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{analytics.totalPromotions}</h3>
              </div>
              <div className="text-4xl">🎁</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('adminAnalytics.activeUsers30d')}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{analytics.activeUsers}</h3>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('adminAnalytics.revenueMTD')}</p>
                <h3 className="text-3xl font-bold text-white mt-1">${analytics.revenue}</h3>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">{t('adminAnalytics.recentActivity')}</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-gray-300">
              <div className="text-2xl">📊</div>
              <div className="flex-1">
                <p className="text-sm">{t('adminAnalytics.platformActivityHere')}</p>
                <p className="text-xs text-gray-500">{t('adminAnalytics.realTimeUpdates')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t('adminAnalytics.adminDashboard')}</h3>
              <p className="text-blue-200 text-sm">
                {t('adminAnalytics.adminDashboardDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
