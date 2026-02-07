import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');
const API_USERS = import.meta.env.VITE_API_USERS_SCHEDULE || '/api/users';

const PRICE_TYPES = [
  { value: 'individual', labelKey: 'settingsPrices.typeIndividual' },
  { value: 'couples', labelKey: 'settingsPrices.typeCouples' },
  { value: 'private', labelKey: 'settingsPrices.typePrivate' }
];

const normalizePrice = (p) => ({
  id: p.id || crypto.randomUUID(),
  type: p.type === 'individual' || p.type === 'couples' || p.type === 'private' ? p.type : 'individual',
  monthlyPrice: Number(p.monthlyPrice) || 0,
  classesPerWeek: Math.max(1, Math.min(7, Number(p.classesPerWeek) || 1))
});

const normalizePricesList = (data) => {
  const list = Array.isArray(data) ? data : (data?.prices ?? data?.data ?? []);
  return (Array.isArray(list) ? list : []).map(normalizePrice);
};

const SettingsPrices = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const academyId = user?.academyId || user?.academy?._id || user?._id;
  const pricesUrl = academyId
    ? `${API_BASE_URL}${API_USERS.startsWith('/') ? '' : '/'}${API_USERS}/${academyId}/prices`
    : null;

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'individual',
    monthlyPrice: '',
    classesPerWeek: 1
  });
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!academyId || !pricesUrl) {
      setLoading(false);
      return;
    }
    const fetchPrices = async () => {
      try {
        const res = await axios.get(pricesUrl);
        const data = res.data?.prices ?? res.data?.data ?? res.data;
        setPrices(normalizePricesList(data));
      } catch (err) {
        if (err.response?.status !== 404) {
          setMessage({ type: 'error', text: t('settingsPrices.errorLoad') });
        }
        setPrices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [academyId]);

  const savePrices = async (nextPrices) => {
    if (!academyId || !pricesUrl) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(pricesUrl, { prices: nextPrices });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || t('settingsPrices.errorSave')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const monthly = Number(formData.monthlyPrice);
    const perWeek = Math.max(1, Math.min(7, Number(formData.classesPerWeek) || 1));
    if (!monthly || monthly < 0) return;
    const newPrice = normalizePrice({
      id: crypto.randomUUID(),
      type: formData.type,
      monthlyPrice: monthly,
      classesPerWeek: perWeek
    });
    const next = [...prices, newPrice];
    setPrices(next);
    setFormData({ type: 'individual', monthlyPrice: '', classesPerWeek: 1 });
    setShowForm(false);
    await savePrices(next);
  };

  const handleRemove = async (id) => {
    const next = prices.filter((p) => p.id !== id);
    setPrices(next);
    await savePrices(next);
  };

  const getTypeLabel = (type) => {
    const found = PRICE_TYPES.find((t) => t.value === type);
    return found ? t(found.labelKey) : type;
  };

  if (!academyId) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-400">{t('settingsPrices.errorLoad')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-400">{t('settingsPrices.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('settingsPrices.title')}
        </h1>
        <p className="text-gray-400 mb-6">
          {t('settingsPrices.subtitle')}
        </p>

        {message.text && (
          <p className={`mb-4 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message.text}
          </p>
        )}
        {saved && (
          <p className="mb-4 text-sm text-green-400">{t('settingsPrices.saved')}</p>
        )}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
          >
            {showForm ? t('common.cancel') : `+ ${t('settingsPrices.addPrice')}`}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">{t('settingsPrices.addPrice')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('settingsPrices.type')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {PRICE_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('settingsPrices.monthlyPrice')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData((f) => ({ ...f, monthlyPrice: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t('settingsPrices.classesPerWeek')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.classesPerWeek}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, classesPerWeek: e.target.value }))
                  }
                  title={t('settingsPrices.classesPerWeekHint')}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{t('settingsPrices.classesPerWeekHint')}</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
            >
              {saving ? t('common.saving') : t('settingsPrices.addPrice')}
            </button>
          </form>
        )}

        {prices.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-xl font-bold text-white mb-2">{t('settingsPrices.noPricesYet')}</h2>
            <p className="text-gray-400">{t('settingsPrices.noPricesHint')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {prices.map((price) => (
              <li
                key={price.id}
                className="bg-gray-800 rounded-lg border border-gray-700 px-6 py-4 flex items-center justify-between flex-wrap gap-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {price.type === 'individual' ? '👤' : price.type === 'couples' ? '👫' : '🎯'}
                  </span>
                  <div>
                    <p className="font-medium text-white">{getTypeLabel(price.type)}</p>
                    <p className="text-gray-400 text-sm">
                      ₡{Number(price.monthlyPrice).toFixed(2)} {t('settingsPrices.perMonth')} · {price.classesPerWeek} {t('settingsPrices.perWeekLabel')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(price.id)}
                  disabled={saving}
                  className="px-3 py-1.5 text-red-400 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition"
                >
                  {t('settingsPrices.delete')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPrices;
