import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');
const API_USERS_SCHEDULE = import.meta.env.VITE_API_USERS_SCHEDULE || '/api/users';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const defaultDaySchedule = () => ({
  open: true,
  openTime: '09:00',
  closeTime: '18:00'
});

const getInitialSchedule = () =>
  WEEKDAYS.reduce((acc, day) => {
    acc[day] = defaultDaySchedule();
    return acc;
  }, {});

const normalizeDay = (day) => {
  if (!day || typeof day !== 'object') return defaultDaySchedule();
  return {
    open: day.open !== false,
    openTime: day.openTime ?? '09:00',
    closeTime: day.closeTime ?? '18:00'
  };
};

const normalizeSchedule = (data) => {
  const schedule = getInitialSchedule();
  if (!data || typeof data !== 'object') return schedule;
  WEEKDAYS.forEach((day) => {
    schedule[day] = normalizeDay(data[day]);
  });
  return schedule;
};

const SettingsSchedule = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const academyId = user?.academyId || user?.academy?._id || user?._id;

  const [schedule, setSchedule] = useState(getInitialSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const scheduleUrl = `${API_BASE_URL}${API_USERS_SCHEDULE.startsWith('/') ? '' : '/'}${API_USERS_SCHEDULE}/${academyId}/schedule`;

  useEffect(() => {
    if (!academyId) {
      setLoading(false);
      return;
    }
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(scheduleUrl);
        const data = res.data?.schedule ?? res.data?.data ?? res.data;
        setSchedule(normalizeSchedule(data));
      } catch (err) {
        if (err.response?.status !== 404) {
          setMessage({ type: 'error', text: t('settingsSchedule.errorLoad') });
        }
        setSchedule(getInitialSchedule());
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [academyId]);

  const updateDay = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
    setSaved(false);
    setMessage({ type: '', text: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!academyId) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(scheduleUrl, { schedule });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || t('settingsSchedule.errorSave')
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-400">{t('settingsSchedule.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('settingsSchedule.title')}
        </h1>
        <p className="text-gray-400 mb-6">
          {t('settingsSchedule.subtitle')}
        </p>

        {message.text && (
          <p className={`mb-4 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-700">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="flex flex-wrap items-center gap-4 px-6 py-4"
                >
                  <div className="w-28 flex-shrink-0">
                    <span className="font-medium text-white">
                      {t(`classes.days.${day}`)}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule[day]?.open ?? true}
                      onChange={(e) => updateDay(day, 'open', e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-300 text-sm">
                      {schedule[day]?.open ? t('settingsSchedule.open') : t('settingsSchedule.closed')}
                    </span>
                  </label>
                  {schedule[day]?.open && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">{t('settingsSchedule.openTime')}</span>
                        <input
                          type="time"
                          value={schedule[day]?.openTime ?? '09:00'}
                          onChange={(e) => updateDay(day, 'openTime', e.target.value)}
                          className="rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">{t('settingsSchedule.closeTime')}</span>
                        <input
                          type="time"
                          value={schedule[day]?.closeTime ?? '18:00'}
                          onChange={(e) => updateDay(day, 'closeTime', e.target.value)}
                          className="rounded-lg border border-gray-600 bg-gray-700 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || !academyId}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {saving ? t('common.saving') : t('settingsSchedule.save')}
            </button>
            {saved && (
              <span className="text-green-400 text-sm">
                {t('settingsSchedule.saved')}
              </span>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SettingsSchedule;
