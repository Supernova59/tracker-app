import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MealCard = ({ meal, onDelete }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div onClick={() => setOpen(!open)} className="flex items-center justify-between p-3.5 cursor-pointer">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-bold text-[#1a1a2e]">{meal.name}</span>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {Math.round(meal.totals.calories)} kcal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete(meal.id); }} className="bg-transparent border-none cursor-pointer text-gray-300 text-base p-1 rounded-md">✕</button>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-gray-400 text-xs inline-block">▼</motion.span>
        </div>
      </div>
      <div className="px-4 pb-2 flex gap-2">
        <span className="text-xs text-emerald-600 font-semibold">P {Math.round(meal.totals.protein)}g</span>
        <span className="text-xs text-amber-600 font-semibold">G {Math.round(meal.totals.carbs)}g</span>
        <span className="text-xs text-rose-600 font-semibold">L {Math.round(meal.totals.fat)}g</span>
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 py-2.5 px-4">
              <ul className="list-none p-0 m-0 flex flex-col gap-1">
                {meal.ingredients.map(ing => (
                  <li key={ing.uniqueId} className="flex justify-between text-[13px] text-gray-500 py-1 border-b border-gray-50 last:border-0">
                    <span>{ing.displayQty} {ing.name}</span><span className="font-semibold text-gray-700">{Math.round(ing.calcCalories)} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealCard;