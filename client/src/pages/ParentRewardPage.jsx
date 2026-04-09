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
  const [mutationError, setMutationError] = useState('');
  const queryClient = useQueryClient();

  const { data: rewards, isLoading, error: rewardsError } = useQuery({
    queryKey: ['rewards'],
    queryFn: getRewards,
  });

  const onMutationError = (err) => {
    setMutationError(err?.response?.data?.message ?? '操作失败，请重试');
  };

  const createMutation = useMutation({
    mutationFn: () => createReward({ name, cost: Number(cost), icon }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rewards'] }); resetForm(); },
    onError: onMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: () => updateReward(editing._id, { name, cost: Number(cost), icon }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rewards'] }); resetForm(); },
    onError: onMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReward(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rewards'] }); resetForm(); },
    onError: onMutationError,
  });

  const resetForm = () => {
    setName('');
    setCost('');
    setIcon('🎁');
    setEditing(null);
    setShowForm(false);
    setMutationError('');
  };

  const startEdit = (r) => {
    setEditing(r);
    setName(r.name);
    setCost(String(r.cost));
    setIcon(r.icon || '🎁');
    setShowForm(true);
  };

  if (isLoading) return <LoadingSpinner />;

  if (rewardsError) {
    return <p className="text-center text-red-500 py-8">加载失败，请刷新重试</p>;
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">管理奖励</h3>
        <div className="flex gap-2">
          {onBack && <button onClick={onBack} className="text-gray-400 text-sm">返回</button>}
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
          {mutationError && <p className="text-red-500 text-xs">{mutationError}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setMutationError(''); editing ? updateMutation.mutate() : createMutation.mutate(); }}
              className="flex-1 bg-indigo-500 text-white py-2 rounded-lg text-sm font-bold disabled:bg-indigo-300"
              disabled={!name.trim() || !cost || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
            >
              {editing ? '更新' : '创建'}
            </button>
            {editing && (
              <button
                onClick={() => { setMutationError(''); deleteMutation.mutate(editing._id); }}
                className="px-3 bg-red-500 text-white py-2 rounded-lg text-sm"
                disabled={deleteMutation.isPending}
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
        {rewards?.length === 0 && (
          <p className="text-center text-gray-500 py-6">还没有奖励，点击添加</p>
        )}
        {rewards?.map((r) => (
          <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span>{r.icon || '🎁'}</span>
              <span className="text-sm font-medium">{r.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600 font-bold">{r.cost}⭐</span>
              <button onClick={() => startEdit(r)} className="text-indigo-500 text-xs">编辑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
