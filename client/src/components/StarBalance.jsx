export default function StarBalance({ balance }) {
  return (
    <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
      <span>⭐</span>
      <span>{balance ?? 0}</span>
    </div>
  );
}
