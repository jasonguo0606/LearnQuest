import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects, createRecord } from '../services/recordService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentRecordPage({ onBack }) {
  const [subjectId, setSubjectId] = useState('');
  const [taskTemplate, setTaskTemplate] = useState('');
  const [customTaskName, setCustomTaskName] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [mutationError, setMutationError] = useState('');
  const queryClient = useQueryClient();

  const { data: subjects, isLoading, error: subjectsError } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (useTemplate) {
        const subject = subjects?.find((s) => s._id === subjectId);
        const template = subject?.taskTemplates?.find((t) => t.name === taskTemplate);
        if (!subject || !template) {
          return Promise.reject(new Error('无效的科目或任务模板'));
        }
        return createRecord({ subjectId, taskName: template.name, points: template.points });
      }
      return createRecord({
        subjectId,
        taskName: customTaskName,
        points: Number(customPoints),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['stars', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setMutationError('');
      if (data.newAchievements?.length > 0) {
        setSuccessMsg(`🎉 新成就：${data.newAchievements.map((a) => a.title).join('、')}`);
      } else {
        setSuccessMsg('✅ 记录提交成功！');
      }
      setTaskTemplate('');
      setCustomTaskName('');
      setCustomPoints('');
    },
    onError: (err) => {
      setMutationError(err?.response?.data?.message ?? '提交失败，请重试');
    },
  });

  const selectedSubject = subjects?.find((s) => s._id === subjectId);
  const canSubmit = useTemplate ? !!taskTemplate : !!(customTaskName && customPoints);

  if (isLoading) return <LoadingSpinner />;

  if (subjectsError) {
    return <p className="text-center text-red-500 py-8">加载科目失败，请刷新重试</p>;
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">记录成绩</h3>
        <button onClick={onBack} className="text-gray-400 text-sm">返回</button>
      </div>

      <select
        value={subjectId}
        onChange={(e) => { setSubjectId(e.target.value); setTaskTemplate(''); setSuccessMsg(''); }}
        className="w-full px-3 py-2 border rounded-lg mb-3"
      >
        <option value="">选择科目</option>
        {subjects?.map((s) => (
          <option key={s._id} value={s._id}>{`${s.icon} ${s.name}`}</option>
        ))}
      </select>

      {selectedSubject && (
        <>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseTemplate(true)}
              className={`px-3 py-1 rounded-full text-sm ${useTemplate ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}
            >
              模板
            </button>
            <button
              onClick={() => setUseTemplate(false)}
              className={`px-3 py-1 rounded-full text-sm ${!useTemplate ? 'bg-indigo-500 text-white' : 'bg-gray-100'}`}
            >
              自定义
            </button>
          </div>

          {useTemplate ? (
            <select
              value={taskTemplate}
              onChange={(e) => setTaskTemplate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3"
            >
              <option value="">选择任务</option>
              {selectedSubject.taskTemplates?.map((t) => (
                <option key={t.name} value={t.name}>{t.name} (+{t.points}⭐)</option>
              ))}
            </select>
          ) : (
            <div className="space-y-3 mb-3">
              <input
                type="text"
                value={customTaskName}
                onChange={(e) => setCustomTaskName(e.target.value)}
                placeholder="任务名称"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                placeholder="星星数"
                min="1"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          )}

          {mutationError && <p className="text-red-500 text-sm mb-2">{mutationError}</p>}
          {successMsg && <p className="text-green-600 text-sm mb-2">{successMsg}</p>}

          <button
            onClick={() => { if (canSubmit) mutation.mutate(); }}
            disabled={mutation.isPending || !canSubmit}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-bold disabled:bg-indigo-300"
          >
            {mutation.isPending ? '提交中...' : '确认提交'}
          </button>
        </>
      )}
    </div>
  );
}
