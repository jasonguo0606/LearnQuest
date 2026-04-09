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
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
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
