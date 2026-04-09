export default function AchievementBadge({ title, description, icon, isUnlocked, progress, target }) {
  const pct = target > 0 ? Math.min(100, ((progress ?? 0) / target) * 100) : 0;

  if (!isUnlocked && title === '???') {
    return (
      <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center text-center">
        <span className="text-3xl mb-1">❓</span>
        <span className="text-xs text-gray-400">隐藏成就</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-3 flex flex-col items-center text-center transition-all ${
        isUnlocked
          ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <span className={`text-3xl mb-1 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
        {icon}
      </span>
      <span className={`text-xs font-medium ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
        {isUnlocked ? title : '未达成'}
      </span>
      {!isUnlocked && target > 0 && (
        <div className="w-full mt-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 mt-0.5">
            {progress ?? 0}/{target}
          </span>
        </div>
      )}
      {isUnlocked && (
        <span className="text-xs text-gray-500 mt-1">{description}</span>
      )}
    </div>
  );
}
