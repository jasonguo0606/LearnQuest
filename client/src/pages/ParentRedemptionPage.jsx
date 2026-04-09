import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRedemptions, confirmRedemption } from '../services/redemptionService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentRedemptionPage({ onBack }) {
  const queryClient = useQueryClient();
  const [confirmError, setConfirmError] = useState('');

  const { data: redemptions, isLoading, error } = useQuery({
    queryKey: ['redemptions', 'pending'],
    queryFn: () => getRedemptions('pending'),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmRedemption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'pending'] });
      setConfirmError('');
    },
    onError: (err) => {
      setConfirmError(err?.response?.data?.message ?? '确认失败，请重试');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) return <p className="text-center text-red-500 py-8">加载失败，请刷新重试</p>;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">兑换确认</h3>
        {onBack && <button onClick={onBack} className="text-gray-400 text-sm">返回</button>}
      </div>

      {confirmError && <p className="text-red-500 text-sm mb-2">{confirmError}</p>}

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
                disabled={confirmMutation.isPending}
                className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold disabled:bg-green-300"
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
