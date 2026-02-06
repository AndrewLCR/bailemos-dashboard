import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');

const EnrollmentDetail = () => {
  const { enrollmentId } = useParams();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const academyId = user?.academyId || user?.academy?._id || user?._id;

  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchEnrollment = async () => {
    if (!academyId || !enrollmentId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/academy/${academyId}/enrollments/${enrollmentId}`
      );
      setEnrollment(res.data?.enrollment ?? res.data ?? null);
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      setEnrollment(null);
      const msg =
        error.response?.status === 403 || error.response?.status === 404
          ? t('enrollments.errorLoad')
          : error.response?.data?.message || t('enrollments.errorLoad');
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollment();
  }, [academyId, enrollmentId]);

  const handleApprove = async () => {
    if (!academyId || !enrollmentId) return;
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.patch(
        `${API_BASE_URL}/api/academy/${academyId}/enrollments/${enrollmentId}`,
        { status: 'approved' }
      );
      setMessage({ type: 'success', text: t('enrollments.approveSuccess') });
      setEnrollment((prev) => (prev ? { ...prev, status: 'approved' } : null));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('enrollments.errorApprove') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!academyId || !enrollmentId) return;
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    setShowRejectModal(false);
    try {
      const body = { status: 'rejected' };
      if (rejectReason.trim()) body.reason = rejectReason.trim();
      await axios.patch(
        `${API_BASE_URL}/api/academy/${academyId}/enrollments/${enrollmentId}`,
        body
      );
      setMessage({ type: 'success', text: t('enrollments.rejectSuccess') });
      setEnrollment((prev) => (prev ? { ...prev, status: 'rejected' } : null));
      setRejectReason('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('enrollments.errorReject') });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    setRejectReason('');
    setShowRejectModal(true);
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

  if (!academyId) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">{t('enrollments.errorLoad')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-400 text-lg">{t('enrollments.loading')}</p>
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
          <Link
            to="/dashboard/enrollments"
            className="text-purple-400 hover:text-purple-300"
          >
            ← {t('enrollments.backToList')}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const applicant = enrollment.applicant || enrollment.user || enrollment;
  const fullNameRaw = enrollment.fullName || applicant?.fullName;
  const fullName =
    typeof fullNameRaw === 'object' && fullNameRaw !== null && 'name' in fullNameRaw
      ? fullNameRaw.name
      : typeof fullNameRaw === 'string'
        ? fullNameRaw
        : '-';
  const isPending = (enrollment.status || '').toLowerCase() === 'pending';

  const toDisplayValue = (val) => {
    if (val == null || val === '') return '-';
    if (typeof val === 'object' && 'name' in val) return val.name;
    if (typeof val === 'object' && 'title' in val) return val.title;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    return '-';
  };
  const voucherUrl =
    enrollment.voucherUrl ||
    enrollment.voucher?.url ||
    enrollment.paymentVoucherUrl ||
    enrollment.paymentVoucher;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Link
          to="/dashboard/enrollments"
          className="inline-flex items-center text-gray-400 hover:text-white text-sm mb-6"
        >
          ← {t('enrollments.backToList')}
        </Link>

        <h1 className="text-3xl font-bold text-white mb-6">{t('enrollments.detailTitle')}</h1>

        {message.text && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-4">{t('enrollments.applicantInfo')}</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-400">{t('enrollments.fullName')}</dt>
                <dd className="text-white">{fullName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">{t('common.email')}</dt>
                <dd className="text-gray-300">{toDisplayValue(applicant?.email ?? enrollment.email)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">{t('enrollments.phone')}</dt>
                <dd className="text-gray-300">{toDisplayValue(applicant?.phone ?? enrollment.phone)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">{t('enrollments.idNumber')}</dt>
                <dd className="text-gray-300">
                  {toDisplayValue(applicant?.idNumber ?? enrollment.idNumber ?? enrollment.documentId)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">{t('enrollments.submittedDate')}</dt>
                <dd className="text-gray-300">
                  {enrollment.createdAt || enrollment.submittedAt
                    ? new Date(enrollment.createdAt || enrollment.submittedAt).toLocaleString()
                    : '-'}
                </dd>
              </div>
              {enrollment.reviewedAt && (
                <div>
                  <dt className="text-sm text-gray-400">{t('enrollments.reviewedDate')}</dt>
                  <dd className="text-gray-300">{new Date(enrollment.reviewedAt).toLocaleString()}</dd>
                </div>
              )}
              {enrollment.reviewedBy != null && (
                <div>
                  <dt className="text-sm text-gray-400">{t('enrollments.reviewedBy')}</dt>
                  <dd className="text-gray-300">{toDisplayValue(enrollment.reviewedBy)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-400">{t('enrollments.status')}</dt>
                <dd>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(
                      enrollment.status
                    )}`}
                  >
                    {getStatusLabel(enrollment.status)}
                  </span>
                </dd>
              </div>
            </dl>

            {isPending && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? '...' : t('enrollments.approve')}
                </button>
                <button
                  onClick={openRejectModal}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {t('enrollments.reject')}
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-4">{t('enrollments.paymentVoucher')}</h2>
            {voucherUrl ? (
              <div className="rounded-lg overflow-hidden border border-gray-600">
                <img
                  src={voucherUrl}
                  alt={t('enrollments.paymentVoucher')}
                  className="w-full max-h-96 object-contain bg-gray-900"
                />
              </div>
            ) : (
              <p className="text-gray-500">{t('enrollments.paymentVoucher')} — no image</p>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full">
            <p className="text-white font-medium mb-4">{t('enrollments.rejectConfirm')}</p>
            <label className="block text-sm text-gray-400 mb-2">{t('enrollments.rejectReason')}</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('enrollments.rejectReasonPlaceholder')}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg mb-4 resize-none"
              rows="3"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? '...' : t('enrollments.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnrollmentDetail;
