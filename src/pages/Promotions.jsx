import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';

// Environment variables
const API_ESTABLISHMENT_URL = import.meta.env.VITE_API_ESTABLISHMENT_URL || import.meta.env.VITE_API_BASE_URL;
const API_ESTABLISHMENT_PROMOTIONS = import.meta.env.VITE_API_ESTABLISHMENT_PROMOTIONS || '/api/establishment/promotions';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    value: 0,
    validUntil: '',
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${API_ESTABLISHMENT_URL}${API_ESTABLISHMENT_PROMOTIONS}`);
      setPromotions(res.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ESTABLISHMENT_URL}${API_ESTABLISHMENT_PROMOTIONS}`, formData);
      setShowForm(false);
      setFormData({ title: '', description: '', discountType: 'percentage', value: 0, validUntil: '' });
      fetchPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      alert(error.response?.data?.message || 'Failed to create promotion');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Promotions Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Create Promotion'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Create New Promotion</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Discount Type</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="free_pass">Free Pass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Value {formData.discountType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    min="0"
                    disabled={formData.discountType === 'free_pass'}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Valid Until</label>
                <input
                  type="datetime-local"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Create Promotion (with QR Code)
              </button>
            </form>
          </div>
        )}

        {/* Promotions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promo) => (
            <div key={promo._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{promo.description}</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-300 text-sm">
                      <span className="mr-2">🎁</span>
                      <span className="capitalize">{promo.discountType.replace('_', ' ')}</span>
                      {promo.value && `: ${promo.discountType === 'percentage' ? promo.value + '%' : '$' + promo.value}`}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <span className="mr-2">⏰</span>
                      <span>Valid until: {new Date(promo.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {promo.qrCodeData && (
                  <div className="ml-4">
                    <img src={promo.qrCodeData} alt="QR Code" className="w-24 h-24 border-2 border-white rounded" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {promotions.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No promotions yet. Create your first promotion!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Promotions;
