import { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const location = useLocation();

  const getNavItems = () => {
    const items = [
      { path: '/dashboard', labelKey: 'nav.home', icon: '🏠', roles: ['academy', 'establishment', 'admin'] }
    ];

    if (user?.role === 'academy') {
      items.push(
        { path: '/dashboard/classes', labelKey: 'nav.classes', icon: '💃', roles: ['academy'] },
        { path: '/dashboard/bookings', labelKey: 'nav.bookings', icon: '📚', roles: ['academy'] },
        { path: '/dashboard/enrollments', labelKey: 'nav.enrollments', icon: '📋', roles: ['academy'] },
        { path: '/dashboard/students', labelKey: 'nav.students', icon: '👥', roles: ['academy'] },
        {
          labelKey: 'nav.settings',
          icon: '⚙️',
          roles: ['academy'],
          children: [
            { path: '/dashboard/settings/schedule', labelKey: 'nav.schedule' },
            { path: '/dashboard/settings/prices', labelKey: 'nav.prices' }
          ]
        }
      );
    }

    if (user?.role === 'establishment') {
      items.push(
        { path: '/dashboard/events', labelKey: 'nav.events', icon: '🎉', roles: ['establishment'] },
        { path: '/dashboard/promotions', labelKey: 'nav.promotions', icon: '🎁', roles: ['establishment'] }
      );
    }

    if (user?.role === 'admin') {
      items.push(
        { path: '/dashboard/users', labelKey: 'nav.users', icon: '👤', roles: ['admin'] },
        { path: '/dashboard/analytics', labelKey: 'nav.analytics', icon: '📊', roles: ['admin'] }
      );
    }

    return items.filter(item => item.roles.includes(user?.role));
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">{t('nav.navigation')}</h2>
        <nav className="space-y-2">
          {navItems.map((item) =>
            item.children ? (
              <NavGroup
                key={item.labelKey}
                item={item}
                location={location}
                t={t}
              />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{t(item.labelKey)}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>
    </aside>
  );
};

const NavGroup = ({ item, location, t }) => {
  const basePath = item.children?.[0]?.path?.replace(/\/[^/]+$/, '') ?? '';
  const isOpen = basePath && location.pathname.startsWith(basePath);
  const [expanded, setExpanded] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setExpanded(true);
  }, [isOpen]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition w-full text-left ${
          isOpen
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <span className="text-xl">{item.icon}</span>
        <span className="font-medium flex-1">{t(item.labelKey)}</span>
        <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {expanded && (
        <div className="pl-4 space-y-1 border-l border-gray-600 ml-4">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg transition text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="font-medium">{t(child.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
