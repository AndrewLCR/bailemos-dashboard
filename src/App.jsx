import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Promotions from './pages/Promotions';
import Classes from './pages/Classes';
import Students from './pages/Students';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import Enrollments from './pages/Enrollments';
import EnrollmentDetail from './pages/EnrollmentDetail';
import ClassBookings from './pages/ClassBookings';
import SettingsSchedule from './pages/SettingsSchedule';
import SettingsPrices from './pages/SettingsPrices';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem(import.meta.env.VITE_STORAGE_TOKEN_KEY || 'token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/events" 
              element={
                <PrivateRoute>
                  <Events />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/promotions" 
              element={
                <PrivateRoute>
                  <Promotions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/classes" 
              element={
                <PrivateRoute>
                  <Classes />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/enrollments" 
              element={
                <PrivateRoute>
                  <Enrollments />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/enrollments/:enrollmentId" 
              element={
                <PrivateRoute>
                  <EnrollmentDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/bookings" 
              element={
                <PrivateRoute>
                  <ClassBookings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/students" 
              element={
                <PrivateRoute>
                  <Students />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/settings/schedule" 
              element={
                <PrivateRoute>
                  <SettingsSchedule />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/settings/prices" 
              element={
                <PrivateRoute>
                  <SettingsPrices />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/users" 
              element={
                <PrivateRoute>
                  <AdminUsers />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/analytics" 
              element={
                <PrivateRoute>
                  <AdminAnalytics />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
