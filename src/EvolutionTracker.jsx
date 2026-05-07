import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getEncrypted } from './encryptionUtils';
// Suppression de l'import MuscleHeatmap

const EvolutionTracker = () => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseData, setExerciseData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const weights = await getEncrypted('tracker_weight', []);
      const sessions = await getEncrypted('tracker_sessions', []);
      setWeightHistory(weights);
      setWorkoutHistory(sessions);
    };
    loadData();
  }, []);

  const allExercises = Array.from(new Set(
    workoutHistory.flatMap(s => s.exercises.map(e => e.name))
  )).sort();

  useEffect(() => {
    if (!selectedExercise) return;
    const data = workoutHistory
      .filter(s => s.exercises.some(e => e.name === selectedExercise))
      .map(s => {
        const exo = s.exercises.find(e => e.name === selectedExercise);
        const maxWeight = Math.max(...exo.sets.map(set => set.weight));
        return {
          date: s.date.split('-').reverse().slice(0,2).join('/'),
          weight: maxWeight,
          fullDate: s.date
        };
      })
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    setExerciseData(data);
  }, [selectedExercise, workoutHistory]);

  return (
    <div className="p-4 max-w-[480px] mx-auto font-sans pb-24 space-y-6">
      <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">📈 Évolution</h1>

      {/* SECTION POIDS CORPOREL */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Poids de corps (kg)</h2>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" hide={true} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide={true} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelFormatter={(value) => `Date: ${value}`} />
              <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION PROGRESSION FORCE */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Progression des charges</h2>
        <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold outline-none focus:border-indigo-500 bg-gray-50 mb-6">
          <option value="">Choisir un exercice...</option>
          {allExercises.map(exo => (
            <option key={exo} value={exo}>{exo}</option>
          ))}
        </select>
        {selectedExercise && exerciseData.length > 0 ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exerciseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis hide={true} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => [`${value} kg`, 'Charge Max']} />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-10 text-center">
            <span className="text-4xl block mb-2">🏋️‍♂️</span>
            <p className="text-sm text-gray-400 font-medium italic">Sélectionnez un exercice pour voir votre progression</p>
          </div>
        )}
      </div>

      {/* L'ANCIENNE SECTION HEATMAP A ÉTÉ SUPPRIMÉE ICI */}

      {/* DERNIÈRES SÉANCES */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Historique récent</h2>
        {workoutHistory.slice(0, 5).map(session => (
          <div key={session.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-indigo-500 uppercase">{session.date}</p>
              <h3 className="text-sm font-bold text-[#1a1a2e]">{session.muscleGroup}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold">
                {session.exercises.length} EXOS
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvolutionTracker;