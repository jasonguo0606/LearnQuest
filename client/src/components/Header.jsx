import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { verifyPin } from '../services/familyService';
import StarBalance from './StarBalance';
import PINPad from './PINPad';

export default function Header({ showBalance = true }) {
  const { family, isParent, exitParentMode, enterParentMode } = useAuth();
  const [showPin, setShowPin] = useState(false);

  return (
    <header className="sticky top-0 bg-white shadow-sm z-40 safe-top">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">LearnQuest</span>
          {isParent && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
              家长模式
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showBalance && <StarBalance balance={null} />}
          <button
            onClick={() => {
              if (isParent) {
                exitParentMode();
              } else {
                setShowPin(true);
              }
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {showPin && (
        <PINPad
          title="输入家长PIN码"
          onSubmit={async (pin) => {
            try {
              const data = await verifyPin(pin);
              enterParentMode(data.token);
              setShowPin(false);
            } catch {
              alert('PIN码错误');
            }
          }}
          onClose={() => setShowPin(false)}
        />
      )}
    </header>
  );
}
