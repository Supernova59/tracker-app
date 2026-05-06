import React from 'react';
import { motion } from 'framer-motion';

const MacroPill = ({ label, value, goal, colorHex, bgClass, textClass }) => {
  const percentage = Math.min((value / goal) * 100, 100);
  
  return (
    <div className={`flex-1 flex flex-col p-2 rounded-xl ${bgClass}`}>
      <div className="flex justify-between mb-1.5">
        <span className={`text-[10px] font-bold uppercase ${textClass}`}>{label}</span>
        <span className={`text-[10px] font-bold ${textClass}`}>{Math.round(value)}/{goal}g</span>
      </div>
      <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 10 }}
          className="h-full rounded-full"
          style={{ backgroundColor: colorHex }}
        />
      </div>
    </div>
  );
};

export default MacroPill;