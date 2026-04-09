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
  { key: 'redemptions', label: '兑换', icon: '确认' },
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

        <div className="flex bg-white rounded-xl shadow-sm mb-4 overflow-x-auto">
          {parentTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                activeTab === t.key ? 'bg-indigo-500 text-white' : 'text-gray-500'
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
