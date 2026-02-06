import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const Enrollments = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const academyId = user?._id;

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchEnrollments = async () => {
    if (!academyId) {
      setLoading(false);
      setEnrollments([]);
      return;
    }
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await axios.get(`${API_BASE_URL}/api/academy/${academyId}/enrollments`, { params });
      console.log("ENROLLMENTS", res.data);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.enrollments ?? data?.data ?? []);
      setEnrollments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
      const msg = error.response?.status === 403
        ? t('enrollments.errorLoad')
        : error.response?.data?.message || t('enrollments.errorLoad');
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [academyId, statusFilter]);

  const handleApprove = async (e, enrollmentId) => {
    e.stopPropagation();
    if (!academyId) return;
    setActionLoading(enrollmentId);
    setMessage({ type: '', text: '' });
    try {
      await axios.patch(
        `${API_BASE_URL}/api/academy/${academyId}/enrollments/${enrollmentId}`,
        { status: 'approved' }
      );
      setMessage({ type: 'success', text: t('enrollments.approveSuccess') });
      fetchEnrollments();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('enrollments.errorApprove') });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (e, enrollmentId) => {
    e.stopPropagation();
    if (!academyId) return;
    if (!window.confirm(t('enrollments.rejectConfirm'))) return;
    setActionLoading(enrollmentId);
    setMessage({ type: '', text: '' });
    try {
      await axios.patch(
        `${API_BASE_URL}/api/academy/${academyId}/enrollments/${enrollmentId}`,
        { status: 'rejected' }
      );
      setMessage({ type: 'success', text: t('enrollments.rejectSuccess') });
      fetchEnrollments();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('enrollments.errorReject') });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'bg-green-600 text-white';
    if (s === 'rejected') return 'bg-red-600 text-white';
    return 'bg-yellow-600 text-white';
  };

  const getStatusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return t('enrollments.statusApproved');
    if (s === 'rejected') return t('enrollments.statusRejected');
    return t('enrollments.statusPending');
  };

  const filterLabelKey = {
    pending: 'enrollments.filterPending',
    all: 'enrollments.filterAll',
    approved: 'enrollments.filterApproved',
    rejected: 'enrollments.filterRejected',
  };

  const toDisplayValue = (val) => {
    if (val == null || val === '') return '-';
    if (typeof val === 'object' && 'name' in val) return val.name;
    if (typeof val === 'object' && 'title' in val) return val.title;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    return '-';
  };

  if (!academyId) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">{t('enrollments.errorLoad')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">{t('enrollments.title')}</h1>
        <p className="text-gray-400 text-sm mb-6">{t('enrollments.academyScopeNote')}</p>

        {message.text && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-gray-400 text-sm">{t('enrollments.status')}:</span>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === filter
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t(filterLabelKey[filter])}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('enrollments.loading')}</p>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('enrollments.applicantName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('enrollments.phone')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('enrollments.dateSubmitted')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('enrollments.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {enrollments.map((enrollment) => {
                  const applicant = enrollment.applicant || enrollment.user || enrollment;
                  const name = toDisplayValue(enrollment.fullName ?? applicant?.fullName);
                  const isPending = (enrollment.status || '').toLowerCase() === 'pending';
                  const id = enrollment._id || enrollment.id;
                  return (
                    <tr
                      key={id}
                      onClick={() => navigate(`/dashboard/enrollments/${id}`)}
                      className="hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{toDisplayValue(applicant?.email ?? enrollment.email)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{toDisplayValue(applicant?.phone ?? enrollment.phone)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {enrollment.createdAt || enrollment.submittedAt
                          ? new Date(enrollment.createdAt || enrollment.submittedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            enrollment.status
                          )}`}
                        >
                          {getStatusLabel(enrollment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/enrollments/${id}`);
                          }}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          {t('enrollments.viewDetail')}
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={(e) => handleApprove(e, id)}
                              disabled={actionLoading === id}
                              className="text-green-400 hover:text-green-300 mr-3 disabled:opacity-50"
                            >
                              {actionLoading === id ? '...' : t('enrollments.approve')}
                            </button>
                            <button
                              onClick={(e) => handleReject(e, id)}
                              disabled={actionLoading === id}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              {actionLoading === id ? '...' : t('enrollments.reject')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('enrollments.noEnrollments')}</h2>
            <p className="text-gray-400">{t('enrollments.noEnrollmentsFilter')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Enrollments;
