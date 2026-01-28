import DashboardLayout from '../components/DashboardLayout';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Welcome back, {user?.name}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <h3 className="text-2xl font-bold text-white mt-1">Active</h3>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <h3 className="text-2xl font-bold text-white mt-1 capitalize">{user?.role}</h3>
              </div>
              <div className="text-4xl">👤</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Quick Actions</p>
                <h3 className="text-lg font-bold text-white mt-1">Get Started</h3>
              </div>
              <div className="text-4xl">🚀</div>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Getting Started</h2>
          
          {user?.role === 'academy' && (
            <div className="text-gray-300 space-y-2">
              <p>• Create your dance classes and set schedules</p>
              <p>• Manage your enrolled students</p>
              <p>• Track class bookings and payments</p>
            </div>
          )}

          {user?.role === 'establishment' && (
            <div className="text-gray-300 space-y-2">
              <p>• Create and manage dance events</p>
              <p>• Set up promotions with QR codes</p>
              <p>• Attract dancers to your venue</p>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="text-gray-300 space-y-2">
              <p>• Monitor platform activity</p>
              <p>• Manage users and content</p>
              <p>• View analytics and reports</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
