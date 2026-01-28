import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';

// Environment variables
const API_ACADEMY_URL = import.meta.env.VITE_API_ACADEMY_URL || import.meta.env.VITE_API_BASE_URL;
const API_ACADEMY_CLASSES = import.meta.env.VITE_API_ACADEMY_CLASSES || '/api/academy/classes';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'Beginner',
    schedule: '',
    price: 0,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_ACADEMY_URL}${API_ACADEMY_CLASSES}`);
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ACADEMY_URL}${API_ACADEMY_CLASSES}`, formData);
      setShowForm(false);
      setFormData({ name: '', description: '', level: 'Beginner', schedule: '', price: 0 });
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      alert(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Classes Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            {showForm ? 'Cancel' : '+ Create Class'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Create New Class</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Class Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Salsa Basics"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                  placeholder="Describe the class..."
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Schedule</label>
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    placeholder="e.g., Mon/Wed 18:00"
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Monthly Price ($)</label>
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
                Create Class
              </button>
            </form>
          </div>
        )}

        {/* Classes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
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
                  <span>${classItem.price}/month</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="text-lg mr-2">👤</span>
                  <span>Academy: {classItem.academy?.name || 'You'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {classes.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No classes yet. Create your first class!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Classes;
