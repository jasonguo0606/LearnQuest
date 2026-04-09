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
      // Token stored inside authLogin — AuthContext owns all localStorage writes
      authLogin({ familyId: data.familyId, name: data.name, isParent: false, token: data.token });
      navigate(data.initialPetChosen ? '/home' : '/pets/select');
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
            setError('');
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
