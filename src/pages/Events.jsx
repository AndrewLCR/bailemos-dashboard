import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';

// Environment variables
const API_ESTABLISHMENT_URL = import.meta.env.VITE_API_ESTABLISHMENT_URL || import.meta.env.VITE_API_BASE_URL;
const API_ESTABLISHMENT_EVENTS = import.meta.env.VITE_API_ESTABLISHMENT_EVENTS || '/api/establishment/events';

const Events = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    coverCharge: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_ESTABLISHMENT_URL}${API_ESTABLISHMENT_EVENTS}`);
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ESTABLISHMENT_URL}${API_ESTABLISHMENT_EVENTS}`, formData);
      setShowForm(false);
      setFormData({ name: '', description: '', date: '', coverCharge: 0 });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || t('events.failedCreate'));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">{t('events.management')}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {showForm ? t('common.cancel') : `+ ${t('events.createEvent')}`}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">{t('events.createNewEvent')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('events.eventName')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('common.description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('common.date')}</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('events.coverCharge')}</label>
                  <input
                    type="number"
                    name="coverCharge"
                    value={formData.coverCharge}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                {t('events.createEventButton')}
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition">
              <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{event.description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <span className="text-lg mr-2">📅</span>
                  <span>{new Date(event.date).toLocaleString()}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-lg mr-2">💰</span>
                  <span>₡{event.coverCharge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('events.noEventsYet')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
