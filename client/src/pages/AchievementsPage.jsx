import { useQuery } from '@tanstack/react-query';
import { getAchievements } from '../services/achievementService';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import AchievementBadge from '../components/AchievementBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AchievementsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-6">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">成就墙</h2>

        {isLoading && <LoadingSpinner />}

        {error && (
          <p className="text-center text-red-500">加载失败，请刷新重试</p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {data.map((a) => (
                <AchievementBadge key={a._id} {...a} />
              ))}
            </div>
            <div className="mt-6 text-center text-sm text-gray-500">
              {data.filter((a) => a.isUnlocked).length}/{data.length} 已达成
            </div>
          </>
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
