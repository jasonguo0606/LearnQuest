# LearnQuest Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React + Vite mobile-first frontend for LearnQuest — a children's learning motivation platform with pet care, achievements, reward shop, and parent mode.

**Architecture:** React SPA with React Router v6 for routing, TanStack Query for server state management, Axios for API calls, Tailwind CSS for styling. All API calls go through a centralized service layer. Auth state (family info, tokens, parent mode) managed via React Context.

**Tech Stack:** React 18, Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS v3, Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-04-07-learnquest-design.md`
**Backend Plan:** `docs/superpowers/plans/2026-04-07-learnquest-backend.md`

---

## File Structure

```
client/
├── package.json
├── vite.config.js
├── vitest.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.jsx                    # Entry point: QueryClientProvider + RouterProvider
│   ├── index.css                   # Tailwind directives + custom styles
│   ├── App.jsx                     # Root: AuthProvider + Router
│   ├── App.test.jsx                # Basic smoke test
│   ├── lib/
│   │   ├── api.js                  # Axios instance with auth interceptor
│   │   └── queryClient.js          # QueryClient configuration
│   ├── context/
│   │   └── AuthContext.jsx         # Auth state (family, token, parent mode)
│   ├── services/
│   │   ├── familyService.js        # register, login, verifyPin API calls
│   │   ├── subjectService.js       # CRUD subjects
│   │   ├── recordService.js        # CRUD records, calendar
│   │   ├── petService.js           # pet CRUD, feed, unlock, switch
│   │   ├── achievementService.js   # fetch achievements
│   │   ├── rewardService.js        # CRUD rewards
│   │   ├── redemptionService.js    # CRUD redemptions
│   │   └── statsService.js         # fetch stats, balance
│   ├── components/
│   │   ├── PetDisplay.jsx           # SVG pet rendering with level-based visuals
│   │   ├── PetDisplay.test.jsx
│   │   ├── StarBalance.jsx          # Star badge component
│   │   ├── BottomTabs.jsx           # Bottom tab navigation
│   │   ├── BottomTabs.test.jsx
│   │   ├── PINPad.jsx               # 4-digit PIN input modal
│   │   ├── PINPad.test.jsx
│   │   ├── AchievementBadge.jsx     # Achievement badge with progress bar
│   │   ├── AchievementBadge.test.jsx
│   │   ├── Header.jsx               # Top header with settings icon
│   │   └── LoadingSpinner.jsx       # Simple loading indicator
│   ├── pages/
│   │   ├── RegisterPage.jsx         # Registration screen
│   │   ├── PetSelectPage.jsx        # Initial pet selection
│   │   ├── HomePage.jsx             # Main pet screen (child mode)
│   │   ├── HomePage.test.jsx
│   │   ├── AchievementsPage.jsx     # Achievement wall
│   │   ├── ShopPage.jsx             # Reward shop with tabs
│   │   ├── RecordsPage.jsx          # Learning records calendar
│   │   ├── ParentRecordPage.jsx     # Parent: record grades
│   │   ├── ParentRewardPage.jsx     # Parent: manage rewards
│   │   ├── ParentRedemptionPage.jsx # Parent: confirm redemptions
│   │   └── ParentStatsPage.jsx      # Parent: stats panel
│   └── hooks/
│       ├── useFamily.js             # Auth context hook
│       └── useStars.js              # Star balance hook (TanStack Query wrapper)
├── tests/
│   └── setup.js                     # Vitest setup: cleanup, msw
└── public/
    └── pets/                        # SVG pet images (placeholder for now)
```

---

## Phase 1: Auth + Child Mode (4 pages + core infra)

### Task 1: Project Scaffolding

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/vitest.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/index.css`
- Create: `client/src/App.jsx`
- Create: `client/src/App.test.jsx`
- Create: `client/tests/setup.js`

- [ ] **Step 1: Initialize client package**

```bash
cd client
npm init -y
npm install react react-dom react-router-dom @tanstack/react-query axios
npm install -D vite @vitejs/plugin-react tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

- [ ] **Step 2: Create package.json scripts**

`client/package.json`:
```json
{
  "name": "learnquest-client",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Create Vite config**

`client/vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
});
```

- [ ] **Step 4: Create Vitest setup**

`client/tests/setup.js`:
```js
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 5: Create Tailwind config**

`client/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        accent: '#f59e0b',
        success: '#22c55e',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['"Comic Sans MS"', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

`client/postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create index.html**

`client/index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>LearnQuest</title>
  </head>
  <body class="bg-gray-50 font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create index.css**

`client/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Prevent pull-to-refresh on mobile */
body {
  overscroll-behavior-y: contain;
}

/* Safe area for notched phones */
@supports (padding: max(0px)) {
  .safe-bottom {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
}
```

- [ ] **Step 8: Create main.jsx**

`client/src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

Note: Using `HashRouter` because the app will be deployed as a SPA on Vercel/Netlify — `HashRouter` avoids server-side redirect config.

- [ ] **Step 9: Create App.jsx**

`client/src/App.jsx`:
```jsx
export default function App() {
  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-center py-8">LearnQuest</h1>
      <p className="text-center text-gray-500">Coming soon...</p>
    </div>
  );
}
```

- [ ] **Step 10: Create basic test**

`client/src/App.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  expect(screen.getByText('LearnQuest')).toBeInTheDocument();
});
```

- [ ] **Step 11: Verify setup**

```bash
cd client && npm test
```
Expected: 1 test passes

- [ ] **Step 12: Commit**

```bash
git add client/
git commit -m "feat: scaffold React + Vite frontend project with Tailwind and TanStack Query"
```

---

### Task 2: Auth Context + API Layer

**Files:**
- Create: `client/src/lib/api.js`
- Create: `client/src/lib/queryClient.js`
- Create: `client/src/context/AuthContext.jsx`
- Create: `client/src/hooks/useFamily.js`
- Create: `client/src/services/familyService.js`

- [ ] **Step 1: Write tests for AuthContext**

`client/src/context/AuthContext.test.jsx`:
```jsx
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="isParent">{String(auth.isParent)}</span>
      <span data-testid="familyName">{auth.family?.name ?? ''}</span>
      <button onClick={() => auth.login({ familyId: 'test', name: 'Guo Family', isParent: false })}>
        Login
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

test('provides auth context with login and logout', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');

  act(() => {
    screen.getByText('Login').click();
  });

  expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  expect(screen.getByTestId('familyName')).toHaveTextContent('Guo Family');

  act(() => {
    screen.getByText('Logout').click();
  });

  expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
});
```

- [ ] **Step 2: Create Axios API instance**

`client/src/lib/api.js`:
```js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear token on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.hash = '#/register';
    }
    return Promise.reject(err);
  }
);

export default api;
```

- [ ] **Step 3: Create AuthContext**

`client/src/context/AuthContext.jsx`:
```jsx
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
    // Restore child token if available
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
```

- [ ] **Step 4: Create useFamily hook**

`client/src/hooks/useFamily.js`:
```js
export { useAuth as useFamily } from '../context/AuthContext';
```

- [ ] **Step 5: Create familyService**

`client/src/services/familyService.js`:
```js
import api from '../lib/api';

export const register = async (name, pin) => {
  const res = await api.post('/family/register', { name, pin });
  return res.data.data;
};

export const login = async (familyId) => {
  const res = await api.post('/family/login', { familyId });
  return res.data.data;
};

export const verifyPin = async (pin) => {
  const res = await api.post('/family/verify-pin', { pin });
  return res.data.data;
};
```

- [ ] **Step 6: Wrap App in AuthProvider**

`client/src/App.jsx`:
```jsx
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
```

- [ ] **Step 7: Run tests**

```bash
cd client && npm test
```
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add client/
git commit -m "feat: add auth context, API layer, and family service"
```

---

### Task 3: Register & Login Page

**Files:**
- Create: `client/src/pages/RegisterPage.jsx`
- Create: `client/src/pages/RegisterPage.test.jsx`
- Modify: `client/src/App.jsx` (add routing)

- [ ] **Step 1: Write test for RegisterPage**

`client/src/pages/RegisterPage.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import RegisterPage from './RegisterPage';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

test('renders registration form', () => {
  render(<RegisterPage />, { wrapper: createWrapper() });
  expect(screen.getByText('LearnQuest')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('输入家庭名称')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('输入4位PIN码')).toBeInTheDocument();
  expect(screen.getByText('开始冒险')).toBeInTheDocument();
});
```

- [ ] **Step 2: Create RegisterPage**

`client/src/pages/RegisterPage.jsx`:
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { register, login } from '../services/familyService';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('请输入家庭名称');
      if (!/^\d{4}$/.test(pin)) throw new Error('PIN码必须是4位数字');
      const regData = await register(name.trim(), pin);
      return await login(regData.familyId);
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('childToken', data.token);
      authLogin({ familyId: data.familyId, name: data.name, isParent: false });
      if (data.initialPetChosen) {
        navigate('/home');
      } else {
        navigate('/pets/select');
      }
    },
    onError: (err) => {
      setError(err.message || '注册失败，请重试');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">LearnQuest</h1>
        <p className="text-center text-gray-500 mb-6">和孩子一起学习成长！</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              家庭名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入家庭名称"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              4位PIN码
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="输入4位PIN码"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-lg text-center tracking-widest"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-3 rounded-xl text-lg transition-colors"
          >
            {mutation.isPending ? '创建中...' : '开始冒险'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire routing in App.jsx**

`client/src/App.jsx`:
```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';

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
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd client && npm test
```
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add client/
git commit -m "feat: add registration page with routing"
```

---

### Task 4: Pet Select Page

**Files:**
- Create: `client/src/pages/PetSelectPage.jsx`
- Create: `client/src/pages/PetSelectPage.test.jsx`
- Create: `client/src/services/petService.js`
- Modify: `client/src/App.jsx` (add route)

- [ ] **Step 1: Create petService**

`client/src/services/petService.js`:
```js
import api from '../lib/api';

export const getPets = async () => {
  const res = await api.get('/pets');
  return res.data.data;
};

export const choosePet = async (type, name) => {
  const res = await api.post('/pets/choose', { type, name });
  return res.data.data;
};

export const feedPet = async (petId) => {
  const res = await api.post(`/pets/${petId}/feed`);
  return res.data.data;
};

export const unlockPet = async (type, name) => {
  const res = await api.post('/pets/unlock', { type, name });
  return res.data.data;
};

export const switchActivePet = async (petId) => {
  const res = await api.put(`/pets/${petId}/active`);
  return res.data.data;
};
```

- [ ] **Step 2: Write test for PetSelectPage**

`client/src/pages/PetSelectPage.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import PetSelectPage from './PetSelectPage';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

test('renders pet selection with 3 initial pets', () => {
  render(<PetSelectPage />, { wrapper: createWrapper() });
  expect(screen.getByText('选择你的宠物')).toBeInTheDocument();
  expect(screen.getByText('小猫咪')).toBeInTheDocument();
  expect(screen.getByText('小狗狗')).toBeInTheDocument();
  expect(screen.getByText('小兔子')).toBeInTheDocument();
});
```

- [ ] **Step 3: Create PetSelectPage**

`client/src/pages/PetSelectPage.jsx`:
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getPets, choosePet } from '../services/petService';
import PetDisplay from '../components/PetDisplay';

export default function PetSelectPage() {
  const [selected, setSelected] = useState(null);
  const [petName, setPetName] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { family } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: getPets,
  });

  const mutation = useMutation({
    mutationFn: () => choosePet(selected.type, petName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      navigate('/home');
    },
  });

  const initialPets = data?.available?.filter((p) => p.unlockCost === 0) ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-100 p-4">
      <h1 className="text-2xl font-bold text-center text-green-700 mb-2">
        {family?.name}
      </h1>
      <p className="text-center text-gray-600 mb-6">选择你的宠物</p>

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
        {initialPets.map((pet) => (
          <button
            key={pet.type}
            onClick={() => setSelected(pet)}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              selected?.type === pet.type
                ? 'border-green-500 bg-green-50 shadow-md scale-105'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="text-4xl mb-2">
              {pet.type === 'cat' && '🐱'}
              {pet.type === 'dog' && '🐶'}
              {pet.type === 'rabbit' && '🐰'}
            </div>
            <span className="text-sm font-medium text-gray-700">{pet.name}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm mx-auto">
          <div className="flex justify-center mb-4">
            <PetDisplay type={selected.type} level={1} mood="happy" />
          </div>
          <p className="text-center text-gray-500 text-sm mb-4">
            {selected.description}
          </p>
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="给宠物取个名字吧！"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-lg mb-4"
          />
          <button
            onClick={() => {
              if (petName.trim()) mutation.mutate();
            }}
            disabled={!petName.trim() || mutation.isPending}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 rounded-xl text-lg transition-colors"
          >
            {mutation.isPending ? '选择中...' : '确认选择'}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Wire route in App.jsx**

Add to App.jsx routes:
```jsx
<Route
  path="/pets/select"
  element={
    <RequireAuth>
      <PetSelectPage />
    </RequireAuth>
  }
/>
```

- [ ] **Step 5: Run tests and commit**

```bash
cd client && npm test
git add client/
git commit -m "feat: add pet selection page"
```

---

### Task 5: Core Components (PetDisplay, BottomTabs, StarBalance, Header, PINPad, AchievementBadge)

**Files:**
- Create: `client/src/components/PetDisplay.jsx`
- Create: `client/src/components/PetDisplay.test.jsx`
- Create: `client/src/components/BottomTabs.jsx`
- Create: `client/src/components/BottomTabs.test.jsx`
- Create: `client/src/components/StarBalance.jsx`
- Create: `client/src/components/Header.jsx`
- Create: `client/src/components/PINPad.jsx`
- Create: `client/src/components/PINPad.test.jsx`
- Create: `client/src/components/AchievementBadge.jsx`
- Create: `client/src/components/AchievementBadge.test.jsx`
- Create: `client/src/components/LoadingSpinner.jsx`

- [ ] **Step 1: Create PetDisplay**

`client/src/components/PetDisplay.jsx`:
```jsx
const petEmojis = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  dragon: '🐲',
  unicorn: '🦄',
};

const moodEmojis = {
  happy: '😊',
  normal: '😐',
  hungry: '😢',
};

/**
 * @param {{ type: string, level: number, mood: 'happy' | 'normal' | 'hungry' }} props
 */
export default function PetDisplay({ type, level, mood }) {
  const emoji = petEmojis[type] || petEmojis.cat;
  const moodEmoji = moodEmojis[mood] || moodEmojis.normal;

  // Visual evolution based on level
  const size = level >= 10 ? 'text-8xl' : level >= 5 ? 'text-7xl' : 'text-6xl';
  const hasHat = level >= 5;
  const hasWings = level >= 10;

  return (
    <div className="relative inline-block">
      <div className={`${size} select-none`}>{emoji}</div>
      {hasHat && (
        <span className="absolute -top-2 -right-2 text-2xl">🎩</span>
      )}
      {hasWings && (
        <span className="absolute -top-4 -left-4 text-3xl">🪽</span>
      )}
      <div className="absolute -bottom-1 -right-1 text-xl bg-white rounded-full p-1 shadow">
        {moodEmoji}
      </div>
      <div className="absolute -bottom-1 -left-1 bg-indigo-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
        {level}
      </div>
    </div>
  );
}
```

`client/src/components/PetDisplay.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import PetDisplay from './PetDisplay';

test('renders cat with level badge and mood', () => {
  render(<PetDisplay type="cat" level={3} mood="happy" />);
  // Level badge should be visible
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('adds hat at level 5+', () => {
  const { container } = render(<PetDisplay type="dog" level={5} mood="normal" />);
  expect(container.querySelector('span.text-2xl')).toBeInTheDocument();
});

test('adds wings at level 10+', () => {
  const { container } = render(<PetDisplay type="rabbit" level={10} mood="hungry" />);
  expect(container.querySelector('span.text-3xl')).toBeInTheDocument();
});
```

- [ ] **Step 2: Create BottomTabs**

`client/src/components/BottomTabs.jsx`:
```jsx
import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/achievements', icon: '🏆', label: '成就' },
  { path: '/shop', icon: '🛒', label: '商城' },
  { path: '/records', icon: '📋', label: '记录' },
];

export default function BottomTabs() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 min-w-16 transition-colors ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs mt-1">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

`client/src/components/BottomTabs.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomTabs from './BottomTabs';

test('renders all 4 tabs', () => {
  render(
    <MemoryRouter>
      <BottomTabs />
    </MemoryRouter>
  );
  expect(screen.getByText('首页')).toBeInTheDocument();
  expect(screen.getByText('成就')).toBeInTheDocument();
  expect(screen.getByText('商城')).toBeInTheDocument();
  expect(screen.getByText('记录')).toBeInTheDocument();
});
```

- [ ] **Step 3: Create StarBalance**

`client/src/components/StarBalance.jsx`:
```jsx
export default function StarBalance({ balance }) {
  return (
    <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
      <span>⭐</span>
      <span>{balance ?? 0}</span>
    </div>
  );
}
```

- [ ] **Step 4: Create Header**

`client/src/components/Header.jsx`:
```jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StarBalance from './StarBalance';
import PINPad from './PINPad';

export default function Header({ showBalance = true }) {
  const { family, isParent, exitParentMode } = useAuth();
  const [showPin, setShowPin] = useState(false);

  return (
    <header className="sticky top-0 bg-white shadow-sm z-40 safe-top">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">LearnQuest</span>
          {isParent && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
              家长模式
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showBalance && <StarBalance balance={null} />}
          <button
            onClick={() => {
              if (isParent) {
                exitParentMode();
              } else {
                setShowPin(true);
              }
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {showPin && (
        <PINPad
          title="输入家长PIN码"
          onSubmit={(pin) => {
            setShowPin(false);
            // Will be handled by parent component via props
          }}
          onClose={() => setShowPin(false)}
        />
      )}
    </header>
  );
}
```

- [ ] **Step 5: Create PINPad**

`client/src/components/PINPad.jsx`:
```jsx
import { useState } from 'react';

export default function PINPad({ title, onSubmit, onClose }) {
  const [pin, setPin] = useState('');

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        onSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pin.length
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(String(n))}
              className="py-4 text-xl font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="py-4 text-xl font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="py-4 text-lg text-gray-500 rounded-xl hover:bg-gray-100 active:bg-gray-200"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
```

`client/src/components/PINPad.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PINPad from './PINPad';

test('renders PIN pad with title and digits', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<PINPad title="输入PIN" onSubmit={onSubmit} onClose={() => {}} />);

  expect(screen.getByText('输入PIN')).toBeInTheDocument();

  // Tap 4 digits
  await user.click(screen.getByText('1'));
  await user.click(screen.getByText('2'));
  await user.click(screen.getByText('3'));
  await user.click(screen.getByText('4'));

  expect(onSubmit).toHaveBeenCalledWith('1234');
});
```

- [ ] **Step 6: Create AchievementBadge**

`client/src/components/AchievementBadge.jsx`:
```jsx
export default function AchievementBadge({ title, description, icon, isUnlocked, progress, target }) {
  const pct = target > 0 ? Math.min(100, ((progress ?? 0) / target) * 100) : 0;

  if (!isUnlocked && title === '???') {
    return (
      <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center text-center">
        <span className="text-3xl mb-1">❓</span>
        <span className="text-xs text-gray-400">隐藏成就</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-3 flex flex-col items-center text-center transition-all ${
        isUnlocked
          ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <span className={`text-3xl mb-1 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
        {icon}
      </span>
      <span className={`text-xs font-medium ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
        {isUnlocked ? title : '未达成'}
      </span>
      {!isUnlocked && target > 0 && (
        <div className="w-full mt-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 mt-0.5">
            {progress ?? 0}/{target}
          </span>
        </div>
      )}
      {isUnlocked && (
        <span className="text-xs text-gray-500 mt-1">{description}</span>
      )}
    </div>
  );
}
```

`client/src/components/AchievementBadge.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import AchievementBadge from './AchievementBadge';

test('renders unlocked achievement', () => {
  render(
    <AchievementBadge
      title="初次记录"
      description="完成第一条学习记录"
      icon="⭐"
      isUnlocked
      progress={1}
      target={1}
    />
  );
  expect(screen.getByText('初次记录')).toBeInTheDocument();
  expect(screen.getByText('⭐')).toBeInTheDocument();
});

test('renders locked achievement with progress', () => {
  render(
    <AchievementBadge
      title="学习达人"
      description=""
      icon="🏆"
      isUnlocked={false}
      progress={3}
      target={10}
    />
  );
  expect(screen.getByText('未达成')).toBeInTheDocument();
  expect(screen.getByText('3/10')).toBeInTheDocument();
});

test('renders hidden achievement as question mark', () => {
  render(
    <AchievementBadge
      title="???"
      description="隐藏成就"
      icon="❓"
      isUnlocked={false}
      progress={0}
      target={3}
    />
  );
  expect(screen.getByText('隐藏成就')).toBeInTheDocument();
});
```

- [ ] **Step 7: Create LoadingSpinner**

`client/src/components/LoadingSpinner.jsx`:
```jsx
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin text-3xl">⏳</div>
    </div>
  );
}
```

- [ ] **Step 8: Run tests and commit**

```bash
cd client && npm test
git add client/
git commit -m "feat: add core UI components (PetDisplay, BottomTabs, PINPad, AchievementBadge, Header, StarBalance)"
```

---

### Task 6: Home Page (Pet Main Screen)

**Files:**
- Create: `client/src/hooks/useStars.js`
- Create: `client/src/services/statsService.js`
- Create: `client/src/pages/HomePage.jsx`
- Create: `client/src/pages/HomePage.test.jsx`
- Modify: `client/src/App.jsx` (add home route with layout)

- [ ] **Step 1: Create statsService**

`client/src/services/statsService.js`:
```js
import api from '../lib/api';

export const getBalance = async () => {
  const res = await api.get('/stars/balance');
  return res.data.data.balance;
};

export const getStats = async () => {
  const res = await api.get('/stats');
  return res.data.data;
};
```

- [ ] **Step 2: Create useStars hook**

`client/src/hooks/useStars.js`:
```js
import { useQuery } from '@tanstack/react-query';
import { getBalance } from '../services/statsService';

export const useStars = () => {
  return useQuery({
    queryKey: ['stars', 'balance'],
    queryFn: getBalance,
    staleTime: 1000 * 30, // 30 seconds
  });
};
```

- [ ] **Step 3: Write test for HomePage**

`client/src/pages/HomePage.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import HomePage from './HomePage';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

test('renders home page with pet and feed button', () => {
  render(<HomePage />, { wrapper: createWrapper() });
  expect(screen.getByText('首页')).toBeInTheDocument();
  expect(screen.getByText('喂食')).toBeInTheDocument();
});
```

- [ ] **Step 4: Create HomePage with child layout**

`client/src/pages/HomePage.jsx`:
```jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getPets, feedPet } from '../services/petService';
import { useStars } from '../hooks/useStars';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import PetDisplay from '../components/PetDisplay';
import { FEED_COST } from '../../../../server/src/config/pets';

export default function HomePage() {
  const { isParent } = useAuth();
  const queryClient = useQueryClient();
  const { data: balance } = useStars();
  const [feedMessage, setFeedMessage] = useState('');

  const { data: petData, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: getPets,
  });

  const feedMutation = useMutation({
    mutationFn: () => feedPet(activePet._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['stars', 'balance'] });
      setFeedMessage(data.leveledUp ? '🎉 升级了！' : '喂食成功！');
      setTimeout(() => setFeedMessage(''), 2000);
    },
    onError: () => {
      setFeedMessage('星星不够了！');
      setTimeout(() => setFeedMessage(''), 2000);
    },
  });

  const activePet = petData?.owned?.find((p) => p.isActive);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-50 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-8">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">首页</h2>

        {activePet ? (
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <PetDisplay type={activePet.type} level={activePet.level} mood={activePet.mood} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{activePet.name}</h3>
            <p className="text-sm text-gray-500 mb-1">
              Lv.{activePet.level} · {activePet.mood === 'happy' ? '开心' : activePet.mood === 'normal' ? '普通' : '饿了'}
            </p>

            {/* Exp bar */}
            <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${(activePet.exp / 100) * 100}%` }}
              />
            </div>

            {/* Feed button */}
            <button
              onClick={() => feedMutation.mutate()}
              disabled={feedMutation.isPending || balance < FEED_COST}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors mb-2"
            >
              喂食 (-{FEED_COST}⭐)
            </button>

            {feedMessage && (
              <p className="text-sm text-indigo-600 font-medium mt-2 animate-bounce">
                {feedMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl mb-4">还没有宠物哦</p>
          </div>
        )}

        {/* Today's progress */}
        <div className="mt-8 bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-medium text-gray-700 mb-2">今日完成</h4>
          <p className="text-gray-500 text-sm">
            今天还没有学习记录，加油哦！
          </p>
        </div>

        {isParent && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-medium text-amber-800 mb-2">家长快捷操作</h4>
            <div className="flex gap-2">
              <button className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-medium">
                记录成绩
              </button>
              <button className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-medium">
                查看统计
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
```

- [ ] **Step 5: Wire routes in App.jsx**

Replace the placeholder `/home` route with:
```jsx
<Route
  path="/home"
  element={
    <RequireAuth>
      <HomePage />
    </RequireAuth>
  }
/>
```

- [ ] **Step 6: Run tests and commit**

```bash
cd client && npm test
git add client/
git commit -m "feat: add home page with pet display and feeding"
```

---

### Task 7: Achievements Page

**Files:**
- Create: `client/src/services/achievementService.js`
- Create: `client/src/pages/AchievementsPage.jsx`

- [ ] **Step 1: Create achievementService**

`client/src/services/achievementService.js`:
```js
import api from '../lib/api';

export const getAchievements = async () => {
  const res = await api.get('/achievements');
  return res.data.data;
};
```

- [ ] **Step 2: Create AchievementsPage**

`client/src/pages/AchievementsPage.jsx`:
```jsx
import { useQuery } from '@tanstack/react-query';
import { getAchievements } from '../services/achievementService';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import AchievementBadge from '../components/AchievementBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AchievementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-6">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">成就墙</h2>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {data?.map((a) => (
              <AchievementBadge key={a._id} {...a} />
            ))}
          </div>
        )}

        {data && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {data.filter((a) => a.isUnlocked).length}/{data.length} 已达成
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
```

- [ ] **Step 3: Wire route and commit**

```bash
git add client/
git commit -m "feat: add achievements page with badge grid"
```

---

### Task 8: Shop Page

**Files:**
- Create: `client/src/services/rewardService.js`
- Create: `client/src/services/redemptionService.js`
- Create: `client/src/pages/ShopPage.jsx`

- [ ] **Step 1: Create rewardService and redemptionService**

`client/src/services/rewardService.js`:
```js
import api from '../lib/api';

export const getRewards = async () => {
  const res = await api.get('/rewards');
  return res.data.data;
};

export const createReward = async (data) => {
  const res = await api.post('/rewards', data);
  return res.data.data;
};

export const updateReward = async (id, data) => {
  const res = await api.put(`/rewards/${id}`, data);
  return res.data.data;
};

export const deleteReward = async (id) => {
  const res = await api.delete(`/rewards/${id}`);
  return res.data.data;
};
```

`client/src/services/redemptionService.js`:
```js
import api from '../lib/api';

export const redeem = async (rewardId) => {
  const res = await api.post('/redemptions', { rewardId });
  return res.data.data;
};

export const getRedemptions = async (status) => {
  const url = status ? `/redemptions?status=${status}` : '/redemptions';
  const res = await api.get(url);
  return res.data.data;
};

export const confirmRedemption = async (id) => {
  const res = await api.put(`/redemptions/${id}/confirm`);
  return res.data.data;
};
```

- [ ] **Step 2: Create ShopPage**

`client/src/pages/ShopPage.jsx`:
```jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPets } from '../services/petService';
import { getRewards } from '../services/rewardService';
import { redeem } from '../services/redemptionService';
import { useStars } from '../hooks/useStars';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ShopPage() {
  const [tab, setTab] = useState('rewards'); // 'pets' | 'rewards'
  const queryClient = useQueryClient();
  const { data: balance } = useStars();

  const { data: petData, isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: getPets,
    enabled: tab === 'pets',
  });

  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: getRewards,
    enabled: tab === 'rewards',
  });

  const redeemMutation = useMutation({
    mutationFn: redeem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stars', 'balance'] });
    },
  });

  if (petsLoading || rewardsLoading) return <LoadingSpinner />;

  const availablePets = petData?.available?.filter((p) => !p.owned) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-4">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">商城</h2>

        {/* Tab switcher */}
        <div className="flex bg-white rounded-xl shadow-sm mb-4">
          <button
            onClick={() => setTab('rewards')}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
              tab === 'rewards'
                ? 'bg-amber-500 text-white'
                : 'text-gray-500'
            }`}
          >
            🎁 奖励
          </button>
          <button
            onClick={() => setTab('pets')}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
              tab === 'pets'
                ? 'bg-amber-500 text-white'
                : 'text-gray-500'
            }`}
          >
            🐾 宠物
          </button>
        </div>

        {tab === 'rewards' && (
          <div className="space-y-3">
            {rewards?.length === 0 && (
              <p className="text-center text-gray-500 py-8">还没有奖励哦</p>
            )}
            {rewards?.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.icon || '🎁'}</span>
                  <span className="font-medium text-gray-800">{r.name}</span>
                </div>
                <button
                  onClick={() => redeemMutation.mutate(r._id)}
                  disabled={balance < r.cost || redeemMutation.isPending}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    balance >= r.cost
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {r.cost}⭐
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'pets' && (
          <div className="space-y-3">
            {availablePets.length === 0 && (
              <p className="text-center text-gray-500 py-8">所有宠物都已拥有！</p>
            )}
            {availablePets.map((p) => (
              <div
                key={p.type}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {p.type === 'cat' && '🐱'}
                    {p.type === 'dog' && '🐶'}
                    {p.type === 'rabbit' && '🐰'}
                    {p.type === 'dragon' && '🐲'}
                    {p.type === 'unicorn' && '🦄'}
                  </span>
                  <div>
                    <span className="font-medium text-gray-800 block">{p.name}</span>
                    <span className="text-xs text-gray-500">{p.description}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600">{p.unlockCost}⭐</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
```

- [ ] **Step 3: Wire route and commit**

```bash
git add client/
git commit -m "feat: add shop page with rewards and pet tabs"
```

---

### Task 9: Records Page

**Files:**
- Create: `client/src/services/recordService.js`
- Create: `client/src/pages/RecordsPage.jsx`

- [ ] **Step 1: Create recordService**

`client/src/services/recordService.js`:
```js
import api from '../lib/api';

export const getRecords = async (params = {}) => {
  const res = await api.get('/records', { params });
  return res.data.data;
};

export const getCalendar = async (month) => {
  const res = await api.get('/records/calendar', { params: { month } });
  return res.data.data;
};

export const getSubjects = async () => {
  const res = await api.get('/subjects');
  return res.data.data;
};

export const createRecord = async (data) => {
  const res = await api.post('/records', data);
  return res.data.data;
};
```

- [ ] **Step 2: Create RecordsPage**

`client/src/pages/RecordsPage.jsx`:
```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCalendar, getRecords } from '../services/recordService';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import LoadingSpinner from '../components/LoadingSpinner';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function CalendarGrid({ month, data }) {
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = data?.[key];
    cells.push(
      <div
        key={d}
        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
          dayData
            ? dayData.totalPoints >= 30
              ? 'bg-green-500 text-white'
              : dayData.totalPoints >= 15
              ? 'bg-green-300 text-white'
              : 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        <span>{d}</span>
        {dayData && <span className="text-xs opacity-75">{dayData.totalPoints}⭐</span>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {DAYS.map((d) => (
        <div key={d} className="text-center text-xs text-gray-500 py-1">
          {d}
        </div>
      ))}
      {cells}
    </div>
  );
}

export default function RecordsPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const { data: calendar, isLoading } = useQuery({
    queryKey: ['records', 'calendar', month],
    queryFn: () => getCalendar(month),
  });

  const prevMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setMonth(d.toISOString().slice(0, 7));
  };

  const nextMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m, 1);
    setMonth(d.toISOString().slice(0, 7));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-6">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">学习记录</h2>

        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="text-indigo-600 font-bold text-lg">
            ◀
          </button>
          <span className="font-medium text-gray-700">{month}</span>
          <button onClick={nextMonth} className="text-indigo-600 font-bold text-lg">
            ▶
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : <CalendarGrid month={month} data={calendar} />}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 inline-block" /> 少
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-300 inline-block" /> 中
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500 inline-block" /> 多
          </span>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
```

- [ ] **Step 3: Wire routes for all child pages in App.jsx**

```jsx
<Route path="/achievements" element={<RequireAuth><AchievementsPage /></RequireAuth>} />
<Route path="/shop" element={<RequireAuth><ShopPage /></RequireAuth>} />
<Route path="/records" element={<RequireAuth><RecordsPage /></RequireAuth>} />
```

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: add records page with calendar heatmap"
```

---

## Phase 2: Parent Mode

### Task 10: Parent Mode Integration + Record Grade Page

**Files:**
- Create: `client/src/pages/ParentRecordPage.jsx`
- Modify: `client/src/components/Header.jsx` (wire PIN verification)
- Modify: `client/src/context/AuthContext.jsx` (wire parent token storage)

- [ ] **Step 1: Update AuthContext to handle PIN verification properly**

Add to `AuthContext.jsx`:
```jsx
import { verifyPin } from '../services/familyService';

// Inside AuthProvider, add:
const verifyParentPin = useCallback(async (pin) => {
  try {
    const data = await verifyPin(pin);
    // Store parent token, save child token for later
    localStorage.setItem('childToken', localStorage.getItem('token'));
    localStorage.setItem('token', data.token);
    setIsParent(true);
    return true;
  } catch {
    return false;
  }
}, []);

// Update value object to include verifyParentPin
```

- [ ] **Step 2: Update Header to wire PIN verification**

In `Header.jsx`, update the PINPad onSubmit:
```jsx
import { useMutation } from '@tanstack/react-query';
import { verifyPin } from '../services/familyService';

// Replace the PINPad section with:
{showPin && (
  <PINPad
    title="输入家长PIN码"
    onSubmit={async (pin) => {
      try {
        const data = await verifyPin(pin);
        localStorage.setItem('childToken', localStorage.getItem('token'));
        localStorage.setItem('token', data.token);
        authLogin({ familyId: family.familyId, name: family.name, isParent: true });
        setShowPin(false);
      } catch {
        alert('PIN码错误');
      }
    }}
    onClose={() => setShowPin(false)}
  />
)}
```

- [ ] **Step 3: Create ParentRecordPage**

`client/src/pages/ParentRecordPage.jsx`:
```jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects } from '../services/recordService';
import { createRecord } from '../services/recordService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentRecordPage({ onBack }) {
  const [subjectId, setSubjectId] = useState('');
  const [taskTemplate, setTaskTemplate] = useState('');
  const [customTaskName, setCustomTaskName] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const queryClient = useQueryClient();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (useTemplate) {
        const subject = subjects.find((s) => s._id === subjectId);
        const template = subject.taskTemplates.find((t) => t.name === taskTemplate);
        return createRecord({ subjectId, taskName: template.name, points: template.points });
      }
      return createRecord({
        subjectId,
        taskName: customTaskName,
        points: Number(customPoints),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['stars', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });

      if (data.newAchievements?.length > 0) {
        alert(`🎉 新成就解锁：${data.newAchievements.map((a) => a.title).join('、')}`);
      }
      setTaskTemplate('');
      setCustomTaskName('');
      setCustomPoints('');
    },
  });

  const selectedSubject = subjects?.find((s) => s._id === subjectId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">记录成绩</h3>
        <button onClick={onBack} className="text-gray-400 text-sm">返回</button>
      </div>

      {/* Subject selector */}
      <select
        value={subjectId}
        onChange={(e) => { setSubjectId(e.target.value); setTaskTemplate(''); }}
        className="w-full px-3 py-2 border rounded-lg mb-3"
      >
        <option value="">选择科目</option>
        {subjects?.map((s) => (
          <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
        ))}
      </select>

      {selectedSubject && (
        <>
          {/* Template toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseTemplate(true)}
              className={`px-3 py-1 rounded-full text-sm ${useTemplate ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}
            >
              模板
            </button>
            <button
              onClick={() => setUseTemplate(false)}
              className={`px-3 py-1 rounded-full text-sm ${!useTemplate ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}
            >
              自定义
            </button>
          </div>

          {useTemplate ? (
            <select
              value={taskTemplate}
              onChange={(e) => setTaskTemplate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3"
            >
              <option value="">选择任务</option>
              {selectedSubject.taskTemplates?.map((t) => (
                <option key={t.name} value={t.name}>{t.name} (+{t.points}⭐)</option>
              ))}
            </select>
          ) : (
            <div className="space-y-3 mb-3">
              <input
                type="text"
                value={customTaskName}
                onChange={(e) => setCustomTaskName(e.target.value)}
                placeholder="任务名称"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                placeholder="星星数"
                min="1"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          )}

          <button
            onClick={() => {
              if ((useTemplate && taskTemplate) || (!useTemplate && customTaskName && customPoints)) {
                mutation.mutate();
              }
            }}
            disabled={mutation.isPending}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-bold disabled:bg-indigo-300"
          >
            {mutation.isPending ? '提交中...' : '确认提交'}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: add parent mode PIN verification and grade recording page"
```

---

### Task 11: Parent Reward Management Page

**Files:**
- Create: `client/src/pages/ParentRewardPage.jsx`

- [ ] **Step 1: Create ParentRewardPage**

`client/src/pages/ParentRewardPage.jsx`:
```jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRewards, createReward, updateReward, deleteReward } from '../services/rewardService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentRewardPage({ onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [icon, setIcon] = useState('🎁');
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: getRewards,
  });

  const createMutation = useMutation({
    mutationFn: () => createReward({ name, cost: Number(cost), icon }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateReward(editing._id, { name, cost: Number(cost), icon }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteReward(editing._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setCost('');
    setIcon('🎁');
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (r) => {
    setEditing(r);
    setName(r.name);
    setCost(String(r.cost));
    setIcon(r.icon);
    setShowForm(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">管理奖励</h3>
        <div className="flex gap-2">
          <button onClick={onBack} className="text-gray-400 text-sm">返回</button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="text-indigo-600 text-sm font-medium"
          >
            + 添加
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="奖励名称"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="所需星星"
            min="1"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
              className="flex-1 bg-indigo-500 text-white py-2 rounded-lg text-sm font-bold disabled:bg-indigo-300"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? '更新' : '创建'}
            </button>
            {editing && (
              <button
                onClick={() => deleteMutation.mutate()}
                className="px-3 bg-red-500 text-white py-2 rounded-lg text-sm"
              >
                删除
              </button>
            )}
            <button onClick={resetForm} className="px-3 bg-gray-200 py-2 rounded-lg text-sm">
              取消
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rewards?.map((r) => (
          <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span>{r.icon || '🎁'}</span>
              <span className="text-sm font-medium">{r.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600 font-bold">{r.cost}⭐</span>
              <button onClick={() => startEdit(r)} className="text-indigo-500 text-xs">
                编辑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/
git commit -m "feat: add parent reward management page"
```

---

### Task 12: Parent Redemption Confirmation + Stats Page

**Files:**
- Create: `client/src/pages/ParentRedemptionPage.jsx`
- Create: `client/src/pages/ParentStatsPage.jsx`
- Modify: `client/src/App.jsx` (add parent routes)

- [ ] **Step 1: Create ParentRedemptionPage**

`client/src/pages/ParentRedemptionPage.jsx`:
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRedemptions, confirmRedemption } from '../services/redemptionService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentRedemptionPage({ onBack }) {
  const queryClient = useQueryClient();

  const { data: redemptions, isLoading } = useQuery({
    queryKey: ['redemptions', 'pending'],
    queryFn: () => getRedemptions('pending'),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmRedemption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'pending'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">兑换确认</h3>
        <button onClick={onBack} className="text-gray-400 text-sm">返回</button>
      </div>

      {redemptions?.length === 0 && (
        <p className="text-center text-gray-500 py-6">没有待确认的兑换</p>
      )}

      <div className="space-y-2">
        {redemptions?.map((r) => (
          <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium">{r.rewardName}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600 font-bold">{r.cost}⭐</span>
              <button
                onClick={() => confirmMutation.mutate(r._id)}
                className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
              >
                确认
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ParentStatsPage**

`client/src/pages/ParentStatsPage.jsx`:
```jsx
import { useQuery } from '@tanstack/react-query';
import { getStats } from '../services/statsService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useStars } from '../hooks/useStars';

export default function ParentStatsPage({ onBack }) {
  const { data: balance } = useStars();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">学习统计</h3>
        <button onClick={onBack} className="text-gray-400 text-sm">返回</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-indigo-50 rounded-xl p-3 text-center">
          <span className="text-2xl font-bold text-indigo-600">{stats?.totalRecords ?? 0}</span>
          <span className="block text-xs text-gray-500">学习次数</span>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <span className="text-2xl font-bold text-amber-600">{stats?.totalStarsEarned ?? 0}</span>
          <span className="block text-xs text-gray-500">累计获得</span>
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-3 text-center mb-4">
        <span className="text-2xl font-bold text-green-600">{balance ?? 0}</span>
        <span className="block text-xs text-gray-500">当前余额</span>
      </div>

      {/* Subject breakdown */}
      <h4 className="font-medium text-gray-700 mb-2">科目统计</h4>
      <div className="space-y-2">
        {stats?.subjectBreakdown?.map((s) => (
          <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span>{s.subjectIcon}</span>
              <span className="text-sm font-medium">{s.subjectName}</span>
            </div>
            <div className="text-sm text-gray-500">
              {s.count}次 · {s.totalPoints}⭐
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire all parent routes in App.jsx**

The parent pages are shown inline when in parent mode. Update HomePage to conditionally show parent panels.

Alternatively, create a `ParentLayout` component that wraps parent-specific navigation.

Given the design doc specifies parent mode as an overlay accessible from the settings icon, the simplest approach is:
- Parent pages are rendered as modal/overlay panels within the existing page structure
- When `isParent` is true, the Header shows a "家长模式" badge and exit button
- A parent dashboard route can be added: `/parent` that shows 4 sub-tabs

Create `client/src/pages/ParentDashboard.jsx`:

```jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import ParentRecordPage from './ParentRecordPage';
import ParentRewardPage from './ParentRewardPage';
import ParentRedemptionPage from './ParentRedemptionPage';
import ParentStatsPage from './ParentStatsPage';

const parentTabs = [
  { key: 'record', label: '记录', icon: '📝' },
  { key: 'rewards', label: '奖励', icon: '🎁' },
  { key: 'redemptions', label: '兑换', icon: '✅' },
  { key: 'stats', label: '统计', icon: '📊' },
];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('record');
  const { exitParentMode } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header showBalance={false} />

      <div className="max-w-lg mx-auto px-4 pt-4">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">家长中心</h2>

        {/* Parent tab switcher */}
        <div className="flex bg-white rounded-xl shadow-sm mb-4 overflow-x-auto">
          {parentTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'record' && <ParentRecordPage />}
        {activeTab === 'rewards' && <ParentRewardPage />}
        {activeTab === 'redemptions' && <ParentRedemptionPage />}
        {activeTab === 'stats' && <ParentStatsPage />}
      </div>

      <BottomTabs />
    </div>
  );
}
```

Add route to App.jsx:
```jsx
<Route
  path="/parent"
  element={
    <RequireAuth>
      <ParentDashboard />
    </RequireAuth>
  }
/>
```

Update Header to navigate to parent dashboard:
```jsx
// When PIN verified, navigate to /parent
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// In the PIN onSubmit:
navigate('/parent');
```

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: add parent dashboard with record, reward, redemption, and stats tabs"
```

---

### Task 13: Integration Testing + Polish

**Files:**
- Modify: `client/src/index.css` (add polish)
- Modify: `client/src/App.jsx` (redirects, error boundary)

- [ ] **Step 1: Add error boundary**

`client/src/App.jsx` - wrap everything in an ErrorBoundary:

```jsx
import { Component } from 'react';

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

// Wrap App content:
<ErrorBoundary>
  <AuthProvider>
    <Routes>...</Routes>
  </AuthProvider>
</ErrorBoundary>
```

- [ ] **Step 2: Add responsive and accessibility polish**

Add to `client/src/index.css`:
```css
/* Custom scrollbar for webkit */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

/* Focus visible for keyboard users */
*:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

- [ ] **Step 3: Run full test suite**

```bash
cd client && npm test
```
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: add error boundary and accessibility polish"
```

---

## Summary

| Task | What it builds | Phase |
|------|---------------|-------|
| 1 | Project scaffolding (Vite, Tailwind, TanStack Query) | Phase 1 |
| 2 | Auth Context + API layer + services | Phase 1 |
| 3 | Registration & login page | Phase 1 |
| 4 | Pet selection page | Phase 1 |
| 5 | Core components (PetDisplay, BottomTabs, PINPad, etc.) | Phase 1 |
| 6 | Home page (pet main screen) | Phase 1 |
| 7 | Achievements page | Phase 1 |
| 8 | Shop page | Phase 1 |
| 9 | Records page (calendar heatmap) | Phase 1 |
| 10 | Parent mode PIN + grade recording | Phase 2 |
| 11 | Parent reward management | Phase 2 |
| 12 | Parent redemption + stats dashboard | Phase 2 |
| 13 | Error boundary + polish | Phase 2 |

**Total: 13 tasks, ~15+ components, complete frontend application**
