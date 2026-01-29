import DashboardLayout from '../components/DashboardLayout';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          {t('dashboard.welcomeBack', { name: user?.name })}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('dashboard.status')}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{t('dashboard.active')}</h3>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('common.role')}</p>
                <h3 className="text-2xl font-bold text-white mt-1 capitalize">{user?.role}</h3>
              </div>
              <div className="text-4xl">👤</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('dashboard.quickActions')}</p>
                <h3 className="text-lg font-bold text-white mt-1">{t('dashboard.getStarted')}</h3>
              </div>
              <div className="text-4xl">🚀</div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.gettingStarted')}</h2>
          
          {user?.role === 'academy' && (
            <div className="text-gray-300 space-y-2">
              <p>• {t('dashboard.academyTip1')}</p>
              <p>• {t('dashboard.academyTip2')}</p>
              <p>• {t('dashboard.academyTip3')}</p>
            </div>
          )}

          {user?.role === 'establishment' && (
            <div className="text-gray-300 space-y-2">
              <p>• {t('dashboard.establishmentTip1')}</p>
              <p>• {t('dashboard.establishmentTip2')}</p>
              <p>• {t('dashboard.establishmentTip3')}</p>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="text-gray-300 space-y-2">
              <p>• {t('dashboard.adminTip1')}</p>
              <p>• {t('dashboard.adminTip2')}</p>
              <p>• {t('dashboard.adminTip3')}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
