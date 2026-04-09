import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getPets, feedPet } from '../services/petService';
import { useStars } from '../hooks/useStars';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import PetDisplay from '../components/PetDisplay';

const FEED_COST = 5;

export default function HomePage() {
  const { isParent } = useAuth();
  const queryClient = useQueryClient();
  const { data: balance } = useStars();
  const [feedMessage, setFeedMessage] = useState('');

  const { data: petData, isLoading, error: petError } = useQuery({
    queryKey: ['pets'],
    queryFn: getPets,
  });

  const activePet = petData?.owned?.find((p) => p.isActive);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  if (petError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">加载失败，请刷新重试</p>
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

            <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${(activePet.exp / 100) * 100}%` }}
              />
            </div>

            <button
              onClick={() => feedMutation.mutate()}
              disabled={feedMutation.isPending || !activePet || (balance ?? 0) < FEED_COST}
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

        <div className="mt-8 bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-medium text-gray-700 mb-2">今日完成</h4>
          <p className="text-gray-500 text-sm">今天还没有学习记录，加油哦！</p>
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
