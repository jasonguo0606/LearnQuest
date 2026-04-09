import { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import PetSelectPage from './pages/PetSelectPage';
import HomePage from './pages/HomePage';
import AchievementsPage from './pages/AchievementsPage';
import ShopPage from './pages/ShopPage';
import RecordsPage from './pages/RecordsPage';
import ParentDashboard from './pages/ParentDashboard';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">出错了</h2>
            <p className="text-gray-500">请刷新页面重试</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/register" />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/pets/select"
          element={
            <RequireAuth>
              <PetSelectPage />
            </RequireAuth>
          }
        />
        <Route
          path="/achievements"
          element={
            <RequireAuth>
              <AchievementsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/shop"
          element={
            <RequireAuth>
              <ShopPage />
            </RequireAuth>
          }
        />
        <Route
          path="/records"
          element={
            <RequireAuth>
              <RecordsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/parent"
          element={
            <RequireAuth>
              <ParentDashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/register" />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
