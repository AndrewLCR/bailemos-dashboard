import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');
const API_ADMIN_USERS = import.meta.env.VITE_API_ADMIN_USERS || '/api/admin/users';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    dancers: 0,
    academies: 0,
    establishments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_ADMIN_USERS}`);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.users ?? data?.data ?? []);
      const userList = Array.isArray(list) ? list : [];
      setUsers(userList);

      const totalUsers = userList.length;
      const dancers = userList.filter((u) => u.role === 'dancer').length;
      const academies = userList.filter((u) => u.role === 'academy').length;
      const establishments = userList.filter((u) => u.role === 'establishment').length;
      setStats({ totalUsers, dancers, academies, establishments });
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setStats({ totalUsers: 0, dancers: 0, academies: 0, establishments: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadUsers() {
      await fetchUsers();
    }
    loadUsers();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">{t('adminUsers.title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('adminUsers.totalUsers')}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('adminUsers.dancers')}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.dancers}</h3>
              </div>
              <div className="text-4xl">💃</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('adminUsers.academies')}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.academies}</h3>
              </div>
              <div className="text-4xl">🏫</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{t('adminUsers.establishments')}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.establishments}</h3>
              </div>
              <div className="text-4xl">🏢</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('adminUsers.loading')}</p>
          </div>
        ) : users.length > 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('adminUsers.joined')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-600 text-white capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.createdAt || user.created_at
                        ? new Date(user.createdAt || user.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-400 hover:text-blue-300 mr-3">{t('common.view')}</button>
                      <button className="text-red-400 hover:text-red-300">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('adminUsers.noUsersYet')}</h2>
            <p className="text-gray-400">
              {t('adminUsers.userDataWillAppear')}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
