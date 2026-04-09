const petEmojis = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  dragon: '🐲',
  unicorn: '🦄',
};

const moodEmojis = {
  happy: '😊',
  normal: '😐',
  hungry: '😢',
};

export default function PetDisplay({ type, level, mood }) {
  const emoji = petEmojis[type] || petEmojis.cat;
  const moodEmoji = moodEmojis[mood] || moodEmojis.normal;
  const size = level >= 10 ? 'text-8xl' : level >= 5 ? 'text-7xl' : 'text-6xl';
  const hasHat = level >= 5;
  const hasWings = level >= 10;

  return (
    <div className="relative inline-block">
      <div className={`${size} select-none`}>{emoji}</div>
      {hasHat && (
        <span className="absolute -top-2 -right-2 text-2xl">🎩</span>
      )}
      {hasWings && (
        <span className="absolute -top-4 -left-4 text-3xl">🪽</span>
      )}
      <div className="absolute -bottom-1 -right-1 text-xl bg-white rounded-full p-1 shadow">
        {moodEmoji}
      </div>
      <div className="absolute -bottom-1 -left-1 bg-indigo-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
        {level}
      </div>
    </div>
  );
}
