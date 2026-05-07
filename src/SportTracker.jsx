import React, { useState, useEffect } from 'react';
import { getEncrypted, saveEncrypted } from './encryptionUtils';
import { useWorkoutStore } from './store/useWorkoutStore';

const SportTracker = () => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState([]);

  const { routines, fetchRoutines, addRoutine, applyRoutineToSession } = useWorkoutStore();

  useEffect(() => {
    fetchRoutines();
    const loadHistory = async () => {
      const history = await getEncrypted('tracker_sessions', []);
      setWorkoutHistory(history);
    };
    loadHistory();
  }, [fetchRoutines]);

  const groups = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Cardio', 'Mixte'];

  const addExercise = () => {
    setSessionExercises([...sessionExercises, { name: '', sets: [{ reps: 0, weight: 0 }] }]);
  };

  const updateExercise = (index, field, value) => {
    const newExos = [...sessionExercises];
    newExos[index][field] = value;
    setSessionExercises(newExos);
  };

  // Assistant de Surcharge Progressive
  const handleExerciseBlur = (index, exerciseName) => {
    if (!exerciseName.trim()) return;

    for (const session of workoutHistory) {
      const pastExo = session.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase().trim());
      
      if (pastExo && pastExo.sets.length > 0) {
        const currentExo = sessionExercises[index];
        const isPristine = currentExo.sets.length === 1 && currentExo.sets[0].reps === 0 && currentExo.sets[0].weight === 0;

        if (isPristine) {
          const newExos = [...sessionExercises];
          // Copie profonde pour éviter les références mémoire croisées (l'attaque des clones)
          newExos[index].sets = pastExo.sets.map(s => ({ ...s }));
          setSessionExercises(newExos);
        }
        break; 
      }
    }
  };

  const addSet = (exoIndex) => {
    const newExos = [...sessionExercises];
    newExos[exoIndex].sets.push({ reps: 0, weight: 0 });
    setSessionExercises(newExos);
  };

  const updateSet = (exoIndex, setIndex, field, value) => {
    const newExos = [...sessionExercises];
    newExos[exoIndex].sets[setIndex][field] = Number(value);
    setSessionExercises(newExos);
  };

  const removeExercise = (index) => {
    setSessionExercises(sessionExercises.filter((_, i) => i !== index));
  };

  const handleSaveRoutine = async () => {
    if (!routineName || sessionExercises.length === 0) return;
    await addRoutine({
      id: Date.now(),
      name: routineName,
      muscleGroup: activeGroup || 'Mixte',
      exercises: sessionExercises
    });
    setRoutineName('');
    setShowRoutineForm(false);
    alert('Routine sauvegardée !');
  };

  const loadRoutine = (routine) => {
    setSessionExercises(applyRoutineToSession(routine, sessionExercises));
    if (!activeGroup) setActiveGroup(routine.muscleGroup);
  };

  const finishSession = async () => {
    if (sessionExercises.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const newSession = {
      id: Date.now(),
      date: today,
      muscleGroup: activeGroup || 'Mixte',
      exercises: sessionExercises
    };
    
    const updatedHistory = [newSession, ...workoutHistory];
    await saveEncrypted('tracker_sessions', updatedHistory);
    setWorkoutHistory(updatedHistory);
    
    alert('Séance enregistrée dans l\'historique !');
    setSessionExercises([]);
    setActiveGroup(null);
  };

  return (
    <div className="p-4 max-w-[480px] mx-auto font-sans pb-24 space-y-6">
      <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">💪 Sport</h1>

      {/* ROUTINES */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Routines Sauvegardées</h2>
        {routines.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Aucune routine pour le moment.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {routines.map(r => (
              <button 
                key={r.id} 
                onClick={() => loadRoutine(r)}
                className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs border-none cursor-pointer transition-transform hover:scale-105"
              >
                + {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GROUPE MUSCULAIRE */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Groupe musculaire</h2>
        <div className="flex flex-wrap gap-2">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${activeGroup === g ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* SÉANCE EN COURS */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider m-0">Séance du jour</h2>
          {sessionExercises.length > 0 && (
            <button onClick={() => setShowRoutineForm(!showRoutineForm)} className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg border-none cursor-pointer">
              Sauvegarder routine
            </button>
          )}
        </div>

        {showRoutineForm && (
          <div className="mb-4 flex gap-2">
            <input type="text" placeholder="Nom de la routine..." value={routineName} onChange={e => setRoutineName(e.target.value)} className="flex-1 p-2 border-2 border-gray-100 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white" />
            <button onClick={handleSaveRoutine} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs border-none cursor-pointer">Ok</button>
          </div>
        )}

        {sessionExercises.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-medium text-sm">
            Aucun exercice ajouté.
          </div>
        ) : (
          <div className="space-y-4">
            {sessionExercises.map((exo, index) => (
              <div key={index} className="border-2 border-indigo-100 p-5 rounded-2xl relative bg-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <input 
                    type="text" 
                    placeholder="Nom de l'exercice" 
                    value={exo.name} 
                    onChange={(e) => updateExercise(index, 'name', e.target.value)} 
                    onBlur={(e) => handleExerciseBlur(index, e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 bg-gray-50" 
                  />
                  <button onClick={() => removeExercise(index)} className="ml-2 text-rose-500 font-bold bg-rose-50 w-7 h-7 rounded-full flex items-center justify-center border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors text-lg">×</button>
                </div>
                
                <div className="space-y-2.5">
                  {exo.sets.map((set, sIndex) => (
                    <div key={sIndex} className="flex gap-2.5 items-center">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">{sIndex + 1}</span>
                      <input type="number" min="0" step="0.5" placeholder="0" value={set.weight} onChange={(e) => updateSet(index, sIndex, 'weight', e.target.value)} className="flex-1 p-2.5 rounded-lg border-2 border-gray-200 text-center text-sm font-semibold outline-none bg-white focus:border-indigo-500 focus:bg-blue-50" />
                      <span className="text-xs font-bold text-gray-400">×</span>
                      <input type="number" min="0" placeholder="0" value={set.reps} onChange={(e) => updateSet(index, sIndex, 'reps', e.target.value)} className="flex-1 p-2.5 rounded-lg border-2 border-gray-200 text-center text-sm font-semibold outline-none bg-white focus:border-indigo-500 focus:bg-blue-50" />
                    </div>
                  ))}
                </div>
                <button onClick={() => addSet(index)} className="w-full mt-4 bg-emerald-50 text-emerald-600 py-2.5 rounded-lg text-xs font-bold border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors">+ Ajouter une série</button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button onClick={addExercise} className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-gray-200 transition-colors">
            + Nouvel Exercice
          </button>
          {sessionExercises.length > 0 && (
            <button onClick={finishSession} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-200 border-none cursor-pointer hover:bg-emerald-400 transition-colors">
              Terminer la séance
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SportTracker;