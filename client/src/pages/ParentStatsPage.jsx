import { useQuery } from '@tanstack/react-query';
import { getStats } from '../services/statsService';
import { useStars } from '../hooks/useStars';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentStatsPage({ onBack }) {
  const { data: balance } = useStars();
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) return <p className="text-center text-red-500 py-8">加载失败，请刷新重试</p>;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">学习统计</h3>
        {onBack && <button onClick={onBack} className="text-gray-400 text-sm">返回</button>}
      </div>

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
