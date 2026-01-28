import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  // Navigation items based on role
  const getNavItems = () => {
    const items = [
      { path: '/dashboard', label: 'Home', icon: '🏠', roles: ['academy', 'establishment', 'admin'] }
    ];

    if (user?.role === 'academy') {
      items.push(
        { path: '/dashboard/classes', label: 'Classes', icon: '💃', roles: ['academy'] },
        { path: '/dashboard/students', label: 'Students', icon: '👥', roles: ['academy'] }
      );
    }

    if (user?.role === 'establishment') {
      items.push(
        { path: '/dashboard/events', label: 'Events', icon: '🎉', roles: ['establishment'] },
        { path: '/dashboard/promotions', label: 'Promotions', icon: '🎁', roles: ['establishment'] }
      );
    }

    if (user?.role === 'admin') {
      items.push(
        { path: '/dashboard/users', label: 'Users', icon: '👤', roles: ['admin'] },
        { path: '/dashboard/analytics', label: 'Analytics', icon: '📊', roles: ['admin'] }
      );
    }

    return items.filter(item => item.roles.includes(user?.role));
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Navigation</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
