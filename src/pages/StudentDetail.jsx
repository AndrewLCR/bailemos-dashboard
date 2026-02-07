import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');

const DANCER_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const toDisplayValue = (val) => {
  if (val == null || val === '') return '-';
  if (typeof val === 'object' && 'name' in val) return val.name;
  if (typeof val === 'object' && 'title' in val) return val.title;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  return '-';
};

const StudentDetail = () => {
  const { studentId } = useParams();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const academyId = user?.academyId || user?.academy?._id || user?._id;

  const [enrollment, setEnrollment] = useState(null);
  const [stats, setStats] = useState({
    dateEnrolled: null,
    classesBooked: 0,
    classesCancelled: 0,
    monthsActive: 0,
    totalIncome: null,
    danceRolePreferred: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dancerLevel, setDancerLevel] = useState('');
  const [savingLevel, setSavingLevel] = useState(false);

  useEffect(() => {
    if (!academyId || !studentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchEnrollment = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/academy/${academyId}/enrollments/${studentId}`
        );
        const data = res.data?.enrollment ?? res.data ?? null;
        if (cancelled) return;
        setEnrollment(data);
        const rawLevel =
          data?.dancerLevel ?? data?.level ?? data?.applicant?.dancerLevel ?? data?.applicant?.level ?? '';
        const levelStr = typeof rawLevel === 'string' ? rawLevel.trim() : '';
        const normalized =
          DANCER_LEVELS.find((l) => l.toLowerCase() === levelStr.toLowerCase()) || levelStr;
        setDancerLevel(normalized);
        if (!data) return;

        const applicant = data.applicant || data.user || data;
        const studentEmail = (applicant?.email ?? data.email ?? '').toString().toLowerCase().trim();
        const studentIdRef = applicant?._id || data.applicantId;

        const dateEnrolled = data.createdAt || data.submittedAt || data.approvedAt;
        const enrolledDate = dateEnrolled ? new Date(dateEnrolled) : null;
        const now = new Date();
        const monthsActive = enrolledDate
          ? Math.max(0, Math.floor((now - enrolledDate) / (30 * 24 * 60 * 60 * 1000)))
          : 0;

        let classesBooked = 0;
        let classesCancelled = 0;
        const roleCounts = { leader: 0, follower: 0 };

        try {
          const classesRes = await axios.get(`${API_BASE_URL}/api/academy/${academyId}/classes`);
          const classesData = classesRes?.data ?? classesRes ?? [];
          const classesList = Array.isArray(classesData)
            ? classesData
            : (classesData?.classes ?? classesData?.data ?? []);

          for (const cls of classesList) {
            const cid = cls._id || cls.id;
            if (!cid) continue;
            const bookingsRes = await axios.get(
              `${API_BASE_URL}/api/academy/classes/${cid}/bookings`
            ).catch(() => ({ data: [] }));
            const bookingsData = bookingsRes?.data ?? bookingsRes ?? [];
            const list = Array.isArray(bookingsData)
              ? bookingsData
              : (bookingsData?.bookings ?? bookingsData?.data ?? []);

            for (const booking of list) {
              const dancer = booking.dancer || booking.user || booking;
              const bookingEmail = (booking.dancerEmail ?? dancer?.email ?? booking.email ?? '')
                .toString()
                .toLowerCase()
                .trim();
              const match = studentEmail && bookingEmail === studentEmail;
              const idMatch = studentIdRef && (dancer?._id === studentIdRef || booking.dancerId === studentIdRef);
              if (match || idMatch) {
                const status = (booking.status ?? booking.bookingStatus ?? '').toString().toLowerCase();
                const isCancelled = status === 'cancelled' || status === 'canceled';
                if (isCancelled) {
                  classesCancelled += 1;
                } else {
                  classesBooked += 1;
                  const roleRaw = booking.danceRole ?? dancer?.role ?? dancer?.danceRole ?? booking.role;
                  const r = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : '';
                  if (r === 'leader') roleCounts.leader += 1;
                  else if (r === 'follower') roleCounts.follower += 1;
                }
              }
            }
          }

          const danceRolePreferred =
            roleCounts.leader > roleCounts.follower
              ? 'Leader'
              : roleCounts.follower > roleCounts.leader
                ? 'Follower'
                : roleCounts.leader + roleCounts.follower > 0
                  ? 'Both'
                  : null;
          setStats((prev) => ({
            ...prev,
            dateEnrolled,
            classesBooked,
            classesCancelled,
            monthsActive,
            danceRolePreferred,
            totalIncome: data?.totalIncome ?? data?.totalPaid ?? null,
          }));
        } catch (err) {
          setStats((prev) => ({
            ...prev,
            dateEnrolled,
            monthsActive,
            totalIncome: data?.totalIncome ?? data?.totalPaid ?? null,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching student:', error);
          setEnrollment(null);
          setMessage({
            type: 'error',
            text: error.response?.data?.message || t('students.errorLoad'),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEnrollment();
    return () => { cancelled = true; };
  }, [academyId, studentId, t]);

  const handleDancerLevelChange = async (e) => {
    const value = e.target.value;
    setDancerLevel(value);
    if (!academyId || !studentId) return;
    setSavingLevel(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.patch(
        `${API_BASE_URL}/api/academy/${academyId}/enrollments/${studentId}`,
        { dancerLevel: value || undefined, level: value || undefined }
      );
      setEnrollment((prev) => (prev ? { ...prev, dancerLevel: value, level: value } : null));
      setMessage({ type: 'success', text: t('students.levelSaved') });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('students.errorSaveLevel'),
      });
      setDancerLevel(enrollment?.dancerLevel ?? enrollment?.level ?? '');
    } finally {
      setSavingLevel(false);
    }
  };

  if (!academyId) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">{t('students.errorLoad')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-400 text-lg">{t('students.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!enrollment) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {message.text && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/50 text-red-200">{message.text}</div>
          )}
          <Link to="/dashboard/students" className="text-purple-400 hover:text-purple-300">
            ← {t('students.backToList')}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const applicant = enrollment.applicant || enrollment.user || enrollment;
  const fullNameRaw = enrollment.fullName ?? applicant?.fullName;
  const name =
    typeof fullNameRaw === 'object' && fullNameRaw !== null && 'name' in fullNameRaw
      ? fullNameRaw.name
      : typeof fullNameRaw === 'string'
        ? fullNameRaw
        : '-';
  const email = toDisplayValue(applicant?.email ?? enrollment.email);
  const phone = toDisplayValue(applicant?.phone ?? enrollment.phone);
  const pricePackage =
    enrollment.pricePackage ?? enrollment.selectedPackage ?? enrollment.package ?? enrollment.pricePlan;
  const pricePackageLabel = toDisplayValue(pricePackage);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Link
          to="/dashboard/students"
          className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-6"
        >
          ← {t('students.backToList')}
        </Link>

        {message.text && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${
              message.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Full-width profile card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6 w-full">
          <h2 className="text-lg font-bold text-white mb-4">{t('students.profile')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <dt className="text-sm text-gray-400">{t('common.name')}</dt>
              <dd className="text-white font-medium">{name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">{t('enrollments.phone')}</dt>
              <dd className="text-gray-300">{phone}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">{t('common.email')}</dt>
              <dd className="text-gray-300">{email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">{t('students.pricePackage')}</dt>
              <dd className="text-gray-300">{pricePackageLabel}</dd>
            </div>
            <div>
              <label htmlFor="dancer-level" className="block text-sm text-gray-400 mb-2">
                {t('students.dancerLevel')}
              </label>
              <select
                id="dancer-level"
                value={dancerLevel}
                onChange={handleDancerLevelChange}
                disabled={savingLevel}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{t('students.selectLevel')}</option>
                {DANCER_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level === 'Beginner'
                      ? t('classes.levels.beginner')
                      : level === 'Intermediate'
                        ? t('classes.levels.intermediate')
                        : level === 'Advanced'
                          ? t('classes.levels.advanced')
                          : level}
                  </option>
                ))}
              </select>
              {savingLevel && (
                <p className="mt-1.5 text-sm text-gray-400">{t('common.saving')}...</p>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">{t('students.dateEnrolled')}</p>
            <p className="text-white font-semibold text-lg">
              {stats.dateEnrolled
                ? new Date(stats.dateEnrolled).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '-'}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">{t('students.classesBooked')}</p>
            <p className="text-white font-semibold text-lg">{stats.classesBooked}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">{t('students.classesCancelled')}</p>
            <p className="text-white font-semibold text-lg">{stats.classesCancelled}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">{t('students.monthsActive')}</p>
            <p className="text-white font-semibold text-lg">{stats.monthsActive}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">{t('students.totalIncome')}</p>
            <p className="text-white font-semibold text-lg">
              {stats.totalIncome != null && stats.totalIncome !== ''
                ? `₡${Number(stats.totalIncome).toFixed(2)}`
                : '-'}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">{t('students.danceRolePreferred')}</p>
            <p className="text-white font-semibold text-lg">
              {stats.danceRolePreferred ?? '-'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDetail;
