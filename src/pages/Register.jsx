import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'establishment',
    address: '',
    description: '',
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(formData);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 border-2 border-green-500">
      <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl relative">
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="absolute top-4 right-4 px-3 py-1.5 bg-gray-700 text-white rounded border border-gray-600 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
        <h2 className="text-3xl font-bold text-center text-white">{t('auth.registerPartner')}</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">{t('common.name')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">{t('common.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">{t('common.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">{t('common.role')}</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="establishment">{t('auth.establishment')}</option>
              <option value="academy">{t('auth.academy')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">{t('common.address')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">{t('common.description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              rows="3"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {t('auth.register')}
          </button>
        </form>
        <p className="text-center text-gray-400">
          {t('auth.alreadyHaveAccount')} <Link to="/login" className="text-green-400 hover:text-green-300">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
