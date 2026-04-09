import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <h1 className="text-2xl font-bold text-center py-8">LearnQuest</h1>
        <p className="text-center text-gray-500">Coming soon...</p>
      </div>
    </AuthProvider>
  );
}
