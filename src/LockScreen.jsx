import React, { useState, useEffect } from 'react';
import { getEncrypted } from './encryptionUtils';

const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [savedPin, setSavedPin] = useState('1234');

  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 30000;

  // Correction : On attend la réponse de la base de données asynchrone[cite: 2]
  useEffect(() => {
    getEncrypted('tracker_pin', '1234').then(storedPin => {
      if (storedPin) {
        setSavedPin(storedPin);
      }
    });
  }, []);

  const handleDigit = (digit) => {
    if (locked) return;
    if (pin.length < 4) {
      setPin(pin + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    if (locked) return;
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSubmit = () => {
    if (locked) return;
    if (pin === savedPin) {
      setPin('');
      setAttempts(0);
      setError('');
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      setError('Code incorrect');
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
        }, LOCK_TIME);
      }
    }
  };

  const handleClear = () => {
    if (locked) return;
    setPin('');
    setError('');
  };

  const pinPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center z-[2000] font-sans">
      <div className="bg-white rounded-[24px] p-10 w-full max-w-[340px] shadow-2xl text-center mx-4">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="m-0 text-2xl font-bold text-[#1a1a2e] mb-2">Déverrouiller</h1>
          <p className="m-0 text-[13px] text-gray-500 font-medium">Entrez votre code PIN</p>
        </div>

        {/* PIN Display */}
        <div className="bg-gray-100 rounded-xl p-5 mb-6 flex items-center justify-center gap-3 min-h-[60px]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center text-2xl font-bold ${pin.length > i ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-300'}`}>
              {pin.length > i ? '●' : '○'}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-800 p-2.5 rounded-lg text-[13px] font-bold mb-4 border border-red-200">
            {error} {attempts >= MAX_ATTEMPTS ? `(Vérrouillé ${Math.ceil(LOCK_TIME / 1000)}s)` : `(${MAX_ATTEMPTS - attempts} tentatives)`}
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {pinPad.map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              disabled={locked}
              className={`p-4 rounded-xl border-none text-lg font-bold text-[#1a1a2e] transition-all active:scale-95 ${locked ? 'bg-gray-50 opacity-50' : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'}`}
            >
              {digit}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleBackspace}
            disabled={locked}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white text-xs font-bold text-gray-500 active:scale-95 disabled:opacity-50"
          >
            Retour
          </button>
          <button
            onClick={handleClear}
            disabled={locked}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 bg-white text-xs font-bold text-gray-500 active:scale-95 disabled:opacity-50"
          >
            Effacer
          </button>
          <button
            onClick={handleSubmit}
            disabled={locked || pin.length !== 4}
            className={`flex-1 py-3 rounded-xl border-none text-xs font-black transition-all active:scale-95 ${pin.length === 4 && !locked ? 'bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-100' : 'bg-gray-200 text-gray-400'}`}
          >
            OK
          </button>
        </div>

        <p className="mt-5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Code par défaut: <span className="text-gray-600">1234</span>
        </p>
      </div>
    </div>
  );
};

export default LockScreen;