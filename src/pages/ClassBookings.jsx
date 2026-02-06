import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');

// Same day codes as Classes (mon, tue, wed, thu, fri, sat, sun). getDay(): 0=Sun, 1=Mon, ... 6=Sat
const WEEKDAY_CODES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const getTodayCode = () => WEEKDAY_CODES[(new Date().getDay() + 6) % 7];

const getTodayName = () => DAY_NAMES[(new Date().getDay() + 6) % 7];

/** Returns true if the class schedule string indicates the class runs on the given day (today). */
const classRunsToday = (scheduleStr) => {
  if (!scheduleStr || typeof scheduleStr !== 'string') return false;
  const s = scheduleStr.toLowerCase();
  const dayCode = getTodayCode();
  const dayName = getTodayName();
  return new RegExp('\\b' + dayCode + '\\b', 'i').test(scheduleStr) || s.includes(dayName);
};

const toDisplayValue = (val) => {
  if (val == null || val === '') return '-';
  if (typeof val === 'object' && 'name' in val) return val.name;
  if (typeof val === 'object' && 'title' in val) return val.title;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  return '-';
};

const ClassBookings = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const academyId = user?.academyId || user?.academy?._id || user?._id;

  const [classBookings, setClassBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedClassId, setExpandedClassId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [academyId]);

  const fetchData = async () => {
    if (!academyId) {
      setLoading(false);
      setClassBookings([]);
      return;
    }
    try {
      const classesPath = import.meta.env.VITE_API_ACADEMY_CLASSES || '/api/academy/classes';
      const classesUrl = `${API_BASE_URL}${classesPath.startsWith('/') ? '' : '/'}${classesPath}`;
      const academyClassesUrl = `${API_BASE_URL}/api/academy/${academyId}/classes`;

      let classesRes = await axios.get(academyClassesUrl).catch(() => null);
      if (!classesRes || !classesRes.data) {
        classesRes = await axios.get(classesUrl).catch(() => ({ data: [] }));
      }

      const classesData = classesRes?.data ?? classesRes ?? [];
      const classesList = Array.isArray(classesData)
        ? classesData
        : (classesData?.classes ?? classesData?.data ?? []);

      const result = await Promise.all(
        classesList.map(async (cls) => {
          const cid = cls._id;
          if (!cid) {
            return { class: cls, bookingCount: 0, leaderCount: 0, followerCount: 0, dancers: [] };
          }
          const bookingsRes = await axios
            .get(`${API_BASE_URL}/api/academy/classes/${cid}/bookings`)
            .catch(() => ({ data: [] }));
          const bookingsData = bookingsRes?.data ?? bookingsRes ?? [];
          const bookingsList = Array.isArray(bookingsData)
            ? bookingsData
            : (bookingsData?.bookings ?? bookingsData?.data ?? []);
          const dancers = bookingsList.map((booking, idx) => {
            const dancer = booking.dancer || booking.user || booking;
            const name = toDisplayValue(booking.dancerName);
            const email = toDisplayValue(booking.dancerEmail);
            const roleRaw = booking.danceRole ?? dancer.role ?? dancer.danceRole ?? booking.role;
            const danceRole = toDisplayValue(roleRaw);
            const roleLower = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : (typeof danceRole === 'string' ? danceRole.toLowerCase() : '');
            return { _id: dancer._id || booking._id || idx, name, email, danceRole, roleLower };
          });
          const leaderCount = dancers.filter((d) => d.roleLower === 'leader').length;
          const followerCount = dancers.filter((d) => d.roleLower === 'follower').length;
          return { class: cls, bookingCount: dancers.length, leaderCount, followerCount, dancers };
        })
      );

      setClassBookings(
        result.filter(
          (item) =>
            item.class &&
            (item.class._id || item.class.id) &&
            classRunsToday(item.class.schedule)
        )
      );
    } catch (error) {
      console.error('Error fetching class bookings:', error);
      setClassBookings([]);
      setMessage({ type: 'error', text: error.response?.data?.message || t('bookings.errorLoad') });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (classId) => {
    setExpandedClassId((prev) => (prev === classId ? null : classId));
  };

  if (!academyId) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">{t('bookings.errorLoad')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">{t('bookings.title')}</h1>
        <p className="text-gray-400 text-sm mb-6">{t('bookings.subtitleToday')}</p>

        {message.text && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${
              message.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('bookings.loading')}</p>
          </div>
        ) : classBookings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('bookings.noClassesToday')}</h2>
            <p className="text-gray-400">{t('bookings.noClassesHint')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classBookings.map((item) => {
              const cls = item.class;
              const classId = cls._id || cls.id;
              const className = toDisplayValue(cls.name);
              const schedule = typeof cls.schedule === 'string' ? cls.schedule : '-';
              const level = typeof cls.level === 'string' ? cls.level : '-';
              const isExpanded = expandedClassId === classId;

              return (
                <div
                  key={classId}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(classId)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">💃</div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{className}</h2>
                        <p className="text-gray-400 text-sm">
                          {schedule} · {level}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                      <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                        {item.bookingCount} {t('bookings.dancersBooked')}
                      </span>
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                        {item.leaderCount ?? 0} {t('bookings.leaders')}
                      </span>
                      <span className="px-3 py-1 bg-emerald-600 text-white text-sm font-medium rounded-full">
                        {item.followerCount ?? 0} {t('bookings.followers')}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-700 px-6 py-4 bg-gray-800/80">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">{t('bookings.bookedDancers')}</h3>
                      {item.dancers.length === 0 ? (
                        <p className="text-gray-500 text-sm">{t('bookings.noDancersYet')}</p>
                      ) : (
                        <ul className="space-y-2">
                          {item.dancers.map((dancer, idx) => (
                            <li
                              key={dancer._id || idx}
                              className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-700/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {(dancer.name && String(dancer.name).charAt(0).toUpperCase()) || '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{dancer.name}</p>
                                  <p className="text-xs text-gray-400">{dancer.danceRole}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassBookings;
