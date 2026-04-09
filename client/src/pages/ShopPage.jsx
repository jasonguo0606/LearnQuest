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
  const [tab, setTab] = useState('rewards');
  const queryClient = useQueryClient();
  const { data: balance } = useStars();

  const [redeemError, setRedeemError] = useState(null);

  const { data: petData, isLoading: petsLoading, error: petsError } = useQuery({
    queryKey: ['pets'],
    queryFn: getPets,
    enabled: tab === 'pets',
  });

  const { data: rewards, isLoading: rewardsLoading, error: rewardsError } = useQuery({
    queryKey: ['rewards'],
    queryFn: getRewards,
    enabled: tab === 'rewards',
  });

  const redeemMutation = useMutation({
    mutationFn: redeem,
    onSuccess: () => {
      setRedeemError(null);
      queryClient.invalidateQueries({ queryKey: ['stars', 'balance'] });
    },
    onError: (err) => {
      setRedeemError(err?.response?.data?.message ?? '兑换失败，请重试');
    },
  });

  if (petsLoading || rewardsLoading) return <LoadingSpinner />;

  if (petsError || rewardsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">加载失败，请刷新重试</p>
      </div>
    );
  }

  const availablePets = petData?.available?.filter((p) => !p.owned) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-4">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">商城</h2>

        <div className="flex bg-white rounded-xl shadow-sm mb-4">
          <button
            onClick={() => setTab('rewards')}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
              tab === 'rewards' ? 'bg-amber-500 text-white' : 'text-gray-500'
            }`}
          >
            🎁 奖励
          </button>
          <button
            onClick={() => setTab('pets')}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
              tab === 'pets' ? 'bg-amber-500 text-white' : 'text-gray-500'
            }`}
          >
            🐾 宠物
          </button>
        </div>

        {tab === 'rewards' && (
          <div className="space-y-3">
            {redeemError && <p className="text-red-500 text-sm text-center mb-2">{redeemError}</p>}
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
                  disabled={(balance ?? 0) < r.cost || redeemMutation.isPending}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    (balance ?? 0) >= r.cost
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
