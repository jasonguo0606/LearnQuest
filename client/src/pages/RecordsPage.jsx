import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCalendar } from '../services/recordService';
import Header from '../components/Header';
import BottomTabs from '../components/BottomTabs';
import LoadingSpinner from '../components/LoadingSpinner';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function CalendarGrid({ month, data }) {
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = data?.[key];
    cells.push(
      <div
        key={d}
        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
          dayData
            ? dayData.totalPoints >= 30
              ? 'bg-green-500 text-white'
              : dayData.totalPoints >= 15
              ? 'bg-green-300 text-white'
              : 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        <span>{d}</span>
        {dayData && <span className="text-xs opacity-75">{dayData.totalPoints}⭐</span>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {DAYS.map((d) => (
        <div key={d} className="text-center text-xs text-gray-500 py-1">
          {d}
        </div>
      ))}
      {cells}
    </div>
  );
}

export default function RecordsPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const { data: calendar, isLoading } = useQuery({
    queryKey: ['records', 'calendar', month],
    queryFn: () => getCalendar(month),
  });

  const prevMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setMonth(d.toISOString().slice(0, 7));
  };

  const nextMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m, 1);
    setMonth(d.toISOString().slice(0, 7));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-6">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">学习记录</h2>

        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="text-indigo-600 font-bold text-lg">
            ◀
          </button>
          <span className="font-medium text-gray-700">{month}</span>
          <button onClick={nextMonth} className="text-indigo-600 font-bold text-lg">
            ▶
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : <CalendarGrid month={month} data={calendar} />}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 inline-block" /> 少
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-300 inline-block" /> 中
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500 inline-block" /> 多
          </span>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
