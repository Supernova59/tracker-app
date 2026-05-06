import React from 'react';
import { motion } from 'framer-motion';

const SportCard = ({ session, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white p-3.5 rounded-[14px] shadow-sm flex justify-between items-center"
    >
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-bold text-[#1a1a2e] text-sm">{session.name}</span>
          {session.isPR && (
            <span className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase">
              PR
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-indigo-500">
          {session.details}
        </span>
      </div>
      <button
        onClick={() => onDelete(session.id)}
        className="bg-transparent border-none cursor-pointer text-gray-300 text-base p-1"
      >
        ✕
      </button>
    </motion.div>
  );
};

export default SportCard;