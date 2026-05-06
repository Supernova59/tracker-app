import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAsyncStorage } from './hooks/useAsyncStorage';
import { motion } from 'framer-motion';

const EvolutionTracker = () => {
  const [view, setView] = useState('poids'); // 'poids' | 'mensurations'

  const [weightHistory, setWeightHistory, weightLoaded] = useAsyncStorage('tracker_weight', []);
  const [height, setHeight, heightLoaded] = useAsyncStorage('tracker_height', '');
  const [measurements, setMeasurements, measLoaded] = useAsyncStorage('tracker_measurements', []);

  const [newWeight, setNewWeight] = useState('');
  const [newMeas, setNewMeas] = useState({ chest: '', waist: '', arm: '', thigh: '' });

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!newWeight || parseFloat(newWeight) <= 0) return;
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setWeightHistory([...weightHistory, { date: `${today} à ${time}`, weight: parseFloat(newWeight) }]);
    setNewWeight('');
  };

  const handleAddMeasurement = (e) => {
    e.preventDefault();
    if (!newMeas.chest && !newMeas.waist && !newMeas.arm && !newMeas.thigh) return;
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    setMeasurements([...measurements, {
      date: `${today} à ${time}`,
      chest: parseFloat(newMeas.chest) || null,
      waist: parseFloat(newMeas.waist) || null,
      arm: parseFloat(newMeas.arm) || null,
      thigh: parseFloat(newMeas.thigh) || null,
    }]);
    setNewMeas({ chest: '', waist: '', arm: '', thigh: '' });
  };

  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;
  
  const bmiData = useMemo(() => {
    if (!currentWeight || !height || parseFloat(height) <= 0) return null;
    const hMeters = parseFloat(height) / 100;
    const bmi = (currentWeight / (hMeters * hMeters)).toFixed(1);
    let category = { label: 'Obèse', color: 'text-rose-400', bg: 'bg-rose-500/20' };
    if (bmi < 18.5) category = { label: 'Sous-poids', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    else if (bmi < 25) category = { label: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    else if (bmi < 30) category = { label: 'Surpoids', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { value: bmi, ...category };
  }, [currentWeight, height]);

  if (!weightLoaded || !heightLoaded || !measLoaded) return <div className="p-4 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="p-4 max-w-[480px] mx-auto font-sans pb-24">
      
      {/* Sélecteur de vue (Tabs) */}
      <div className="flex bg-gray-200 rounded-xl p-1 mb-5">
        <button 
          onClick={() => setView('poids')} 
          className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${view === 'poids' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'}`}
        >
          Poids & IMC
        </button>
        <button 
          onClick={() => setView('mensurations')} 
          className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${view === 'mensurations' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'}`}
        >
          Mensurations
        </button>
      </div>

      {view === 'poids' ? (
        <>
          {/* Card Poids Actuel */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-[20px] p-5 mb-3.5 shadow-lg text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Poids Actuel</p>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-4xl font-black">{currentWeight || '--'}</span>
                  <span className="text-sm font-medium text-slate-400">kg</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 mb-1">Taille (cm)</p>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  className="w-16 p-1.5 rounded-lg border border-white/20 bg-white/10 text-white text-center text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            {bmiData && (
              <div className={`${bmiData.bg} p-3 rounded-xl flex justify-between items-center`}>
                <div>
                  <span className="text-[10px] block text-white/70 uppercase font-bold">IMC Actuel</span>
                  <span className={`text-sm font-bold ${bmiData.color}`}>{bmiData.label}</span>
                </div>
                <span className={`text-2xl font-black ${bmiData.color}`}>{bmiData.value}</span>
              </div>
            )}
          </div>

          {/* Formulaire ajout poids */}
          <form onSubmit={handleAddWeight} className="bg-white rounded-[20px] p-4 mb-5 shadow-sm border border-gray-50 flex gap-2">
            <input 
              type="number" step="0.1" placeholder="Nouvelle pesée (kg)" 
              value={newWeight} onChange={e => setNewWeight(e.target.value)} 
              className="flex-1 p-3 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500"
            />
            <button 
              type="submit" disabled={!newWeight} 
              className={`px-5 rounded-xl font-bold text-white transition-colors ${newWeight ? 'bg-indigo-600' : 'bg-gray-200 text-gray-400'}`}
            >
              +
            </button>
          </form>

          {/* Graphique Poids */}
          {weightHistory.length > 1 && (
            <div className="bg-white rounded-[20px] p-5 pr-2 mb-5 shadow-sm border border-gray-50">
              <p className="text-sm font-bold text-[#1a1a2e] mb-4">Courbe de progression</p>
              <div className="w-full h-56">
                <ResponsiveContainer>
                  <LineChart data={weightHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Line type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Liste Historique */}
          <div className="space-y-2">
            {weightHistory.slice().reverse().map((entry, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-gray-50">
                <span className="text-xs font-semibold text-gray-500">{entry.date}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-[#1a1a2e]">{entry.weight} kg</span>
                  <button onClick={() => setWeightHistory(weightHistory.filter((_, i) => i !== (weightHistory.length - 1 - idx)))} className="text-gray-300 hover:text-rose-500">✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Formulaire Mensurations */}
          <form onSubmit={handleAddMeasurement} className="bg-white rounded-[20px] p-5 mb-5 shadow-sm border border-gray-50">
            <p className="text-sm font-bold text-[#1a1a2e] mb-4">Nouvelles mensurations (cm)</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {['chest', 'waist', 'arm', 'thigh'].map((field) => (
                <input 
                  key={field} type="number" step="0.1" 
                  placeholder={field === 'chest' ? 'Poitrine' : field === 'waist' ? 'Taille' : field === 'arm' ? 'Bras' : 'Cuisse'} 
                  value={newMeas[field]} 
                  onChange={e => setNewMeas({...newMeas, [field]: e.target.value})} 
                  className="p-3 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500"
                />
              ))}
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200">Enregistrer les mesures</button>
          </form>

          {/* Graphique Mensurations */}
          {measurements.length > 1 && (
            <div className="bg-white rounded-[20px] p-5 pr-2 mb-5 shadow-sm border border-gray-50">
              <p className="text-sm font-bold text-[#1a1a2e] mb-4">Évolution corporelle</p>
              <div className="w-full h-56">
                <ResponsiveContainer>
                  <LineChart data={measurements}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="chest" name="Poitrine" stroke="#4f46e5" strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" dataKey="waist" name="Taille" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" dataKey="arm" name="Bras" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" dataKey="thigh" name="Cuisse" stroke="#f43f5e" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Historique Mensurations */}
          <div className="space-y-2">
            {measurements.slice().reverse().map((entry, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{entry.date}</span>
                  <button onClick={() => setMeasurements(measurements.filter((_, i) => i !== (measurements.length - 1 - idx)))} className="text-gray-300">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  {entry.chest && <div className="flex justify-between text-xs font-medium"><span className="text-gray-400">Poitrine:</span> <span className="font-bold">{entry.chest} cm</span></div>}
                  {entry.waist && <div className="flex justify-between text-xs font-medium"><span className="text-gray-400">Taille:</span> <span className="font-bold">{entry.waist} cm</span></div>}
                  {entry.arm && <div className="flex justify-between text-xs font-medium"><span className="text-gray-400">Bras:</span> <span className="font-bold">{entry.arm} cm</span></div>}
                  {entry.thigh && <div className="flex justify-between text-xs font-medium"><span className="text-gray-400">Cuisse:</span> <span className="font-bold">{entry.thigh} cm</span></div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EvolutionTracker;  