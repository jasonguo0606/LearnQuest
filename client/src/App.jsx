import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import PetSelectPage from './pages/PetSelectPage';
import HomePage from './pages/HomePage';
import AchievementsPage from './pages/AchievementsPage';
import ShopPage from './pages/ShopPage';
import RecordsPage from './pages/RecordsPage';
import ParentDashboard from './pages/ParentDashboard';

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/register" />;
};

export default function App() {
  return (
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
  );
}
