import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {t('header.dashboardTitle')}
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-3">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="text-right">
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-gray-400 text-sm capitalize">{user?.role}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
