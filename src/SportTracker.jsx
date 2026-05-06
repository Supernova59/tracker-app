import React, { useState, useEffect, useMemo } from 'react';
import { exercisesDB, ROUTINES } from './exercisesDB';
import { useAsyncStorage } from './hooks/useAsyncStorage';
import SportCard from './components/SportCard';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ORDER = ["Musculation", "Bodyweight", "Cardio"];
const CATEGORY_LABELS = { Musculation: "Musculation", Bodyweight: "Bodyweight", Cardio: "Cardio" };

const SportTracker = () => {
  const [sessions, setSessions, sessionsLoaded] = useAsyncStorage('tracker_sessions', []);
  const [customExos, setCustomExos, customLoaded] = useAsyncStorage('tracker_custom_exercises', []);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBaseName, setSelectedBaseName] = useState('');
  const [selectedExoId, setSelectedExoId] = useState('');

  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const [showAddExo, setShowAddExo] = useState(false);
  const [newExo, setNewExo] = useState({ name: '', category: 'Musculation', muscle: '', type: 'Poids' });

  const allExercises = useMemo(() => [...exercisesDB, ...customExos], [customExos]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      alert("Fin du repos, c'est reparti !");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startTimer = (s) => { setTimeLeft(s); setTimerActive(true); };
  const stopTimer = () => { setTimeLeft(0); setTimerActive(false); };
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2,'0')}`;

  const groupedByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = allExercises.filter(e => e.category === cat);
    return acc;
  }, {});

  const baseNamesInCategory = selectedCategory
    ? [...new Set(groupedByCategory[selectedCategory].map(e => e.baseName))].sort()
    : [];

  const variantsForBase = selectedBaseName && selectedCategory
    ? groupedByCategory[selectedCategory].filter(e => e.baseName === selectedBaseName)
    : [];

  const selectedExo = selectedExoId ? allExercises.find(e => e.id === parseInt(selectedExoId)) : null;

  const getPR = (exoName) => {
    const hist = sessions.filter(s => s.name === exoName && s.type === "Poids" && s.weight);
    return hist.length ? Math.max(...hist.map(s => parseFloat(s.weight))) : null;
  };

  const handleAddExercise = () => {
    if (!selectedExo) return;
    let isNewPR = false;
    if (selectedExo.type === "Poids" && weight) {
      const pr = getPR(selectedExo.name);
      if (!pr || parseFloat(weight) > pr) isNewPR = true;
    }

    const newEntry = {
      id: Date.now(),
      name: selectedExo.name,
      category: selectedExo.category,
      muscle: selectedExo.muscle,
      type: selectedExo.type,
      sets, reps, weight, duration,
      isPR: isNewPR,
      details: selectedExo.type === "Poids"
        ? `${sets} séries × ${reps} reps à ${weight} kg`
        : selectedExo.type === "Reps"
        ? `${sets} séries × ${reps} reps`
        : `${duration} min`,
    };

    setSessions([newEntry, ...sessions]);
    setSets(''); setReps(''); setWeight(''); setDuration('');
    setSelectedCategory(''); setSelectedBaseName(''); setSelectedExoId('');
  };

  const handleCreateExo = (e) => {
    e.preventDefault();
    if (!newExo.name || !newExo.muscle) return;
    const customE = {
      id: Date.now(),
      name: newExo.name.trim() + " (Perso)",
      baseName: newExo.name.trim(),
      variant: "Perso",
      category: newExo.category,
      muscle: newExo.muscle,
      type: newExo.type
    };
    setCustomExos([...customExos, customE]);
    setShowAddExo(false);
    setNewExo({ name: '', category: 'Musculation', muscle: '', type: 'Poids' });
    setSelectedCategory(customE.category);
    setSelectedBaseName(customE.baseName);
    setSelectedExoId(customE.id.toString());
  };

  const canAdd = !!selectedExo && (
    (selectedExo.type === "Poids" && sets && reps && weight) ||
    (selectedExo.type === "Reps"  && sets && reps) ||
    (selectedExo.type === "Temps" && duration)
  );

  if (!sessionsLoaded || !customLoaded) return <div className="p-4 text-center text-gray-500">Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-sans bg-[#f4f4f7] min-h-screen p-4 max-w-[480px] mx-auto pb-20"
    >
      <AnimatePresence>
        {showDemo && selectedExo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-5 rounded-[24px] w-full max-w-[400px] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-[#1a1a2e] text-lg font-bold">{selectedExo.name}</h3>
                <button onClick={() => setShowDemo(false)} className="bg-transparent border-none text-2xl cursor-pointer text-gray-400">✕</button>
              </div>
              
              <div className="w-full h-[200px] bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-indigo-200 overflow-hidden">
                {selectedExo.gifUrl ? (
                  <img src={selectedExo.gifUrl} alt={selectedExo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl">🏋️</span>
                    <p className="text-xs text-indigo-600 font-semibold mt-2">Animation de l'exercice</p>
                  </div>
                )}
              </div>

              <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                <p className="m-0 text-xs text-red-600 font-bold uppercase">Focus principal</p>
                <p className="mt-1 text-lg text-red-800 font-extrabold">🎯 {selectedExo.muscle}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddExo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.form
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onSubmit={handleCreateExo}
              className="bg-white p-7 rounded-[20px] w-full max-w-[420px] shadow-xl m-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-xl font-bold text-[#1a1a2e]">Créer un exercice</h3>
                <button type="button" onClick={() => setShowAddExo(false)} className="bg-transparent border-none text-2xl cursor-pointer text-gray-400 p-0">✕</button>
              </div>
              <div className="flex flex-col gap-4">
                <input type="text" placeholder="Nom de l'exercice" required value={newExo.name} onChange={e => setNewExo({...newExo, name: e.target.value})} className="p-3 rounded-lg border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500" />
                <div className="flex gap-2">
                  <select value={newExo.category} onChange={e => setNewExo({...newExo, category: e.target.value})} className="flex-2 w-full p-3 rounded-lg border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500">
                    {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newExo.type} onChange={e => setNewExo({...newExo, type: e.target.value})} className="flex-1 w-full p-3 rounded-lg border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500">
                    <option value="Poids">Poids</option>
                    <option value="Reps">Reps</option>
                    <option value="Temps">Temps</option>
                  </select>
                </div>
                <input type="text" placeholder="Muscle ciblé (ex: Pectoraux)" required value={newExo.muscle} onChange={e => setNewExo({...newExo, muscle: e.target.value})} className="p-3 rounded-lg border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500" />
                <button type="submit" className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-none p-3.5 rounded-xl font-bold cursor-pointer text-sm">Sauvegarder l'exercice</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className={`rounded-[18px] p-3.5 mb-3 flex justify-between items-center shadow-sm transition-all duration-300 ${timerActive ? 'bg-[#1a1a2e] border border-indigo-900' : 'bg-white border border-transparent'}`}>
        <div className="flex items-center gap-2.5">
          <span className={`text-xl ${timerActive ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'}`}>⏱️</span>
          <div>
            <p className={`m-0 text-[10px] font-bold uppercase tracking-widest ${timerActive ? 'text-indigo-400' : 'text-gray-400'}`}>Repos</p>
            <p className={`m-0 text-[22px] font-extrabold tabular-nums ${timerActive ? 'text-white' : 'text-[#1a1a2e]'}`}>
              {fmt(timeLeft)}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {timerActive && (
            <button onClick={stopTimer} className="bg-red-100 text-red-600 border-none rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer">⏹ Stop</button>
          )}
          {[['1m', 60], ['1m30', 90], ['2m', 120]].map(([label, sec]) => (
            <button key={label} onClick={() => startTimer(sec)} className={`border-none rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer ${timerActive ? 'bg-white/10 text-indigo-200' : 'bg-gray-100 text-gray-600'}`}>{label}</button>
          ))}
        </div>
      </motion.div>

      <motion.div layout className="bg-white rounded-[18px] p-3 mb-3 shadow-sm">
        <div className="flex justify-between items-center mb-2.5">
          <p className="m-0 text-sm font-extrabold text-[#1a1a2e] tracking-tight">Enregistrer un exercice</p>
          <button onClick={() => setShowAddExo(true)} className="bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1 text-xs font-bold cursor-pointer flex items-center gap-1">+ Créer</button>
        </div>

        <div className="mb-2.5">
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {Object.entries(ROUTINES).map(([name, ids]) => (
              <button key={name} onClick={() => {
                const exo = allExercises.find(e => e.id === ids[0]);
                if (!exo) return;
                const variants = groupedByCategory[exo.category]?.filter(e => e.baseName === exo.baseName) || [];
                setSelectedCategory(exo.category);
                setSelectedBaseName(exo.baseName);
                if (variants.length === 1) setSelectedExoId(variants[0].id.toString());
              }} className="shrink-0 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 text-xs font-bold text-indigo-600 cursor-pointer whitespace-nowrap">
                {name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedBaseName(''); setSelectedExoId(''); }} className="w-full p-2.5 rounded-lg border-2 border-gray-200 mb-2.5 text-xs bg-gray-50 text-[#1a1a2e] focus:border-indigo-500 outline-none">
          <option value="">▼ Catégorie ▼</option>
          {CATEGORY_ORDER.map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
        </select>

        {selectedCategory && (
          <select value={selectedBaseName} onChange={e => { setSelectedBaseName(e.target.value); setSelectedExoId(''); }} className="w-full p-2.5 rounded-lg border-2 border-gray-200 mb-2.5 text-xs bg-gray-50 text-[#1a1a2e] focus:border-indigo-500 outline-none">
            <option value="">▼ Type d'exercice ▼</option>
            {baseNamesInCategory.map(baseName => <option key={baseName} value={baseName}>{baseName}</option>)}
          </select>
        )}

        {selectedBaseName && variantsForBase.length > 1 && (
          <select value={selectedExoId} onChange={e => setSelectedExoId(e.target.value)} className="w-full p-2.5 rounded-lg border-2 border-gray-200 mb-2.5 text-xs bg-gray-50 text-[#1a1a2e] focus:border-indigo-500 outline-none">
            <option value="">▼ Variante ▼</option>
            {variantsForBase.map(exo => <option key={exo.id} value={exo.id}>{exo.variant || 'Standard'}</option>)}
          </select>
        )}

        {selectedBaseName && variantsForBase.length === 1 && !selectedExoId && (() => {
          setTimeout(() => setSelectedExoId(variantsForBase[0].id.toString()), 0);
          return null;
        })()}

        <AnimatePresence>
          {selectedExo && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex justify-between items-center mb-2.5 mt-2">
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[11px] bg-green-50 text-green-800 px-2.5 py-0.5 rounded-full font-semibold border border-green-200">
                    {selectedExo.muscle}
                  </span>
                  <span className="text-[11px] bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
                    {selectedExo.category}
                  </span>
                </div>
                <button onClick={() => setShowDemo(true)} className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer">
                  👀 Comment faire ?
                </button>
              </div>

              {selectedExo.type === "Poids" && getPR(selectedExo.name) && (
                <div className="mb-2.5 bg-yellow-50 border border-yellow-200 rounded-lg py-1.5 px-3 text-xs text-yellow-800 font-semibold">
                  🏆 Record actuel : {getPR(selectedExo.name)} kg
                </div>
              )}

              <div className="mb-2.5 mt-2">
                {selectedExo.type === "Poids" && (
                  <div className="grid grid-cols-3 gap-1">
                    <input type="number" placeholder="Séries" value={sets} onChange={e => setSets(e.target.value)} className="p-2 rounded-lg border-2 border-gray-200 outline-none text-xs bg-gray-50 focus:border-indigo-500 w-full box-border" />
                    <input type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} className="p-2 rounded-lg border-2 border-gray-200 outline-none text-xs bg-gray-50 focus:border-indigo-500 w-full box-border" />
                    <input type="number" placeholder="kg" value={weight} onChange={e => setWeight(e.target.value)} className="p-2 rounded-lg border-2 border-gray-200 outline-none text-xs bg-gray-50 focus:border-indigo-500 w-full box-border" />
                  </div>
                )}
                {selectedExo.type === "Reps" && (
                  <div className="grid grid-cols-2 gap-1">
                    <input type="number" placeholder="Séries" value={sets} onChange={e => setSets(e.target.value)} className="p-2 rounded-lg border-2 border-gray-200 outline-none text-xs bg-gray-50 focus:border-indigo-500 w-full box-border" />
                    <input type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} className="p-2 rounded-lg border-2 border-gray-200 outline-none text-xs bg-gray-50 focus:border-indigo-500 w-full box-border" />
                  </div>
                )}
                {selectedExo.type === "Temps" && (
                  <input type="number" placeholder="Durée (minutes)" value={duration} onChange={e => setDuration(e.target.value)} className="p-2 rounded-lg border-2 border-gray-200 outline-none text-xs bg-gray-50 focus:border-indigo-500 w-full box-border" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleAddExercise}
          disabled={!canAdd}
          className={`w-full border-none p-3 rounded-xl text-sm font-bold transition-colors duration-200 mt-1 ${canAdd ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Valider la série
        </button>
      </motion.div>

      <p className="m-0 mb-2.5 ml-0.5 text-sm font-extrabold text-[#1a1a2e]">
        Historique {sessions.length > 0 && <span className="font-normal text-gray-400">({sessions.length})</span>}
      </p>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {sessions.map(sess => (
            <SportCard key={sess.id} session={sess} onDelete={(id) => setSessions(sessions.filter(s => s.id !== id))} />
          ))}
        </AnimatePresence>

        {sessions.length === 0 && (
          <div className="text-center py-7 px-4 text-gray-400 bg-white rounded-2xl text-sm shadow-sm border border-gray-100">
            Aucun exercice enregistré pour l'instant.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SportTracker;