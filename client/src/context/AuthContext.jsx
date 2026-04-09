import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [family, setFamily] = useState(null);
  const [isParent, setIsParent] = useState(false);

  const login = useCallback(({ familyId, name, isParent: parent }) => {
    setFamily({ familyId, name });
    setIsParent(parent);
  }, []);

  const logout = useCallback(() => {
    setFamily(null);
    setIsParent(false);
    localStorage.removeItem('token');
  }, []);

  const enterParentMode = useCallback((token) => {
    setIsParent(true);
    localStorage.setItem('token', token);
  }, []);

  const exitParentMode = useCallback(() => {
    setIsParent(false);
    const childToken = localStorage.getItem('childToken');
    if (childToken) {
      localStorage.setItem('token', childToken);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        family,
        isParent,
        isAuthenticated: !!family,
        login,
        logout,
        enterParentMode,
        exitParentMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
