import { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Students = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Get the academy's details which includes the students array
      const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || import.meta.env.VITE_API_BASE_URL;
      const API_AUTH_USER = import.meta.env.VITE_API_AUTH_USER || '/api/auth/user';
      const res = await axios.get(`${API_AUTH_URL}${API_AUTH_USER}/${user._id}`);
      
      // In a real implementation, this would be a dedicated endpoint
      // For now, we'll show a placeholder since the backend doesn't have this endpoint yet
      setStudents(res.data?.students || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
      // For demo purposes, show empty state
      setStudents([]);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Enrolled Students</h1>
          <div className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium">
            Total: {students.length}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{student.name}</h3>
                    <p className="text-gray-400 text-sm">{student.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-300 text-sm">
                    <span className="text-lg mr-2">👤</span>
                    <span className="capitalize">{student.role}</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <span className="text-lg mr-2">📅</span>
                    <span>Enrolled: {new Date(student.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Students Yet</h2>
            <p className="text-gray-400 mb-6">
              Students will appear here once they book your classes through the mobile app.
            </p>
            <div className="bg-gray-700 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-gray-300 text-sm">
                💡 <strong>Tip:</strong> Make sure your classes are published and visible to attract dancers!
              </p>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {!loading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Students</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{students.length}</h3>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Bookings</p>
                  <h3 className="text-3xl font-bold text-white mt-1">-</h3>
                </div>
                <div className="text-4xl">📚</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <h3 className="text-3xl font-bold text-white mt-1">$-</h3>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Students;
