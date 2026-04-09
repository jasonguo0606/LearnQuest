import { useState } from 'react';

export default function PINPad({ title, onSubmit, onClose }) {
  const [pin, setPin] = useState('');

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        onSubmit(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pin.length ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(String(n))}
              className="py-4 text-xl font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="py-4 text-xl font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="py-4 text-lg text-gray-500 rounded-xl hover:bg-gray-100 active:bg-gray-200"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
