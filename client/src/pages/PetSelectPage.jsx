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

  const [mutationError, setMutationError] = useState(null);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['pets'],
    queryFn: getPets,
  });

  const mutation = useMutation({
    mutationFn: () => choosePet(selected.type, petName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      navigate('/home');
    },
    onError: (err) => {
      setMutationError(err?.response?.data?.message ?? '选择宠物失败，请重试');
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

  if (queryError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">加载失败，请刷新重试</p>
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
            onChange={(e) => {
              setPetName(e.target.value);
              setMutationError(null);
            }}
            placeholder="给宠物取个名字吧！"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-lg mb-4"
          />
          {mutationError && (
            <p className="text-red-500 text-sm text-center mb-2">{mutationError}</p>
          )}
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
