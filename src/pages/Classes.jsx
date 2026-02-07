import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';

// Environment variables
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');
const VITE_API_ACADEMY_CLASSES = import.meta.env.VITE_API_ACADEMY_CLASSES;
const API_ACADEMY_CLASSES = `${API_BASE_URL}${VITE_API_ACADEMY_CLASSES}`;

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function DayMultiSelect({ value = [], onChange, t, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const selectedSet = new Set(value);
  const allSelected = WEEKDAYS.length > 0 && WEEKDAYS.every((d) => selectedSet.has(d));

  const filteredDays = WEEKDAYS.filter((day) => {
    const label = t(`classes.days.${day}`);
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const toggleDay = (day) => {
    const next = selectedSet.has(day) ? value.filter((d) => d !== day) : [...value, day];
    onChange(next);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : [...WEEKDAYS]);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[2.5rem] px-4 py-2 flex items-center flex-wrap gap-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent text-left"
      >
        <span className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {value.length > 0 ? (
            value.map((day) => (
              <span
                key={day}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-600 text-gray-200 text-sm"
              >
                {t(`classes.days.${day}`)}
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-600">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('classes.searchDays')}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md text-sm placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm text-white">{t('classes.allDays')}</span>
            </label>
            {filteredDays.map((day) => (
              <label
                key={day}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(day)}
                  onChange={() => toggleDay(day)}
                  className="w-4 h-4 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-200">{t(`classes.days.${day}`)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const Classes = () => {
  const { t } = useTranslation();
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'Beginner',
    scheduleDay: [],
    scheduleTime: '',
    price: 0,
  });

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_ACADEMY_CLASSES}`);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.classes ?? data?.data ?? []);
      setClasses(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  useEffect(() => {
    async function loadClasses() {
      await fetchClasses();
    }
    loadClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.scheduleDay?.length) {
      alert(t('classes.scheduleDayPlaceholder'));
      return;
    }
    const dayString = formData.scheduleDay.join(', ');
    const schedule = [dayString, formData.scheduleTime].filter(Boolean).join(' ');
    const payload = { ...formData, schedule };
    delete payload.scheduleDay;
    delete payload.scheduleTime;
    try {
      await axios.post(`${API_ACADEMY_CLASSES}`, payload);
      setShowForm(false);
      setFormData({ name: '', description: '', level: 'Beginner', scheduleDay: [], scheduleTime: '', price: 0 });
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      alert(error.response?.data?.message || t('classes.failedCreate'));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScheduleDayChange = (selected) => {
    setFormData((prev) => ({ ...prev, scheduleDay: selected }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">{t('classes.management')}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            {showForm ? t('common.cancel') : `+ ${t('classes.createClass')}`}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">{t('classes.createNewClass')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('classes.className')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('classes.classNamePlaceholder')}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                  placeholder={t('classes.descriptionPlaceholder')}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('classes.level')}</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Beginner">{t('classes.levels.beginner')}</option>
                    <option value="Intermediate">{t('classes.levels.intermediate')}</option>
                    <option value="Advanced">{t('classes.levels.advanced')}</option>
                    <option value="All Levels">{t('classes.levels.allLevels')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('classes.scheduleDay')}</label>
                  <DayMultiSelect
                    value={formData.scheduleDay}
                    onChange={handleScheduleDayChange}
                    t={t}
                    placeholder={t('classes.scheduleDayPlaceholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('classes.scheduleDayPlaceholder')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('classes.scheduleTime')}</label>
                  <input
                    type="time"
                    name="scheduleTime"
                    value={formData.scheduleTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('classes.monthlyPrice')}</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                {t('classes.createClass')}
              </button>
            </form>
          </div>
        )}

        {/* Classes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(classes) ? classes : []).map((classItem) => (
            <div key={classItem._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{classItem.name}</h3>
                <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                  {classItem.level}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">{classItem.description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-lg mr-2">📅</span>
                  <span>{classItem.schedule}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-lg mr-2">💰</span>
                  <span>₡{classItem.price}{t('classes.perMonth')}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-lg mr-2">👤</span>
                  <span>{t('classes.academy')}: {classItem.academy?.name || t('common.you')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!Array.isArray(classes) || classes.length === 0) && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('classes.noClassesYet')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Classes;
