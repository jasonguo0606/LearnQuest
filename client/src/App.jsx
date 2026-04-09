import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import PetSelectPage from './pages/PetSelectPage';

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
              <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-500">Home (coming soon)</p>
              </div>
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
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </AuthProvider>
  );
}
