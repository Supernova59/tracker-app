import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MealTracker from './MealTracker';
import SportTracker from './SportTracker';
import EvolutionTracker from './EvolutionTracker';
import RecipeBook from './RecipeBook';
import LockScreen from './LockScreen';
import Onboarding from './Onboarding';
import { useAsyncStorage } from './hooks/useAsyncStorage';
import { getEncrypted, saveEncrypted } from './encryptionUtils';
import ShoppingList from './ShoppingList';

const Settings = ({ darkMode, setDarkMode }) => {
  const [goals, setGoals, goalsLoaded] = useAsyncStorage('tracker_goals', { calories: 2500, protein: 160, carbs: 300, fat: 80 });
  const [pinData, setPinData] = useState({ current: '', new: '', confirm: '' });
  const [showPinForm, setShowPinForm] = useState(false);

  const handleSaveGoals = (e) => {
    e.preventDefault();
    setGoals(goals);
    alert('Objectifs mis à jour !');
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    const actualPin = await getEncrypted('tracker_pin', '1234');
    if (pinData.current !== actualPin) {
      alert('Le code actuel est incorrect.');
      return;
    }
    if (pinData.new.length !== 4 || !/^\d+$/.test(pinData.new)) {
      alert('Le nouveau code doit contenir exactement 4 chiffres.');
      return;
    }
    if (pinData.new !== pinData.confirm) {
      alert('Les nouveaux codes ne correspondent pas.');
      return;
    }
    await saveEncrypted('tracker_pin', pinData.new);
    alert('Code PIN mis à jour avec succès !');
    setPinData({ current: '', new: '', confirm: '' });
    setShowPinForm(false);
  };

  const handleExport = async () => {
    const data = {
      meals: await getEncrypted('tracker_meals', []),
      sessions: await getEncrypted('tracker_sessions', []),
      recipes: await getEncrypted('tracker_recipes', []),
      custom_ingredients: await getEncrypted('tracker_custom_ingredients', []),
      weight: await getEncrypted('tracker_weight', []),
      measurements: await getEncrypted('tracker_measurements', []),
      goals: await getEncrypted('tracker_goals', {}),
      pin: await getEncrypted('tracker_pin', '1234')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_tracker_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.meals) await saveEncrypted('tracker_meals', data.meals);
        if (data.sessions) await saveEncrypted('tracker_sessions', data.sessions);
        if (data.recipes) await saveEncrypted('tracker_recipes', data.recipes);
        if (data.custom_ingredients) await saveEncrypted('tracker_custom_ingredients', data.custom_ingredients);
        if (data.weight) await saveEncrypted('tracker_weight', data.weight);
        if (data.measurements) await saveEncrypted('tracker_measurements', data.measurements);
        if (data.goals) await saveEncrypted('tracker_goals', data.goals);
        if (data.pin) await saveEncrypted('tracker_pin', data.pin);
        alert('Données importées ! Rechargez l\'app.');
        window.location.reload();
      } catch (error) {
        alert('Erreur de fichier.');
      }
    };
    reader.readAsText(file);
  };

  if (!goalsLoaded) return null;

  return (
    <div className="p-4 max-w-[480px] mx-auto font-sans pb-24 space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="m-0 mb-4 text-lg font-bold text-[#1a1a2e]">🌙 Apparence</h2>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">Mode Sombre</span>
          <button onClick={() => setDarkMode(!darkMode)} className={`border-none px-4 py-2 rounded-full font-bold text-xs transition-all ${darkMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {darkMode ? 'Activé' : 'Désactivé'}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="m-0 mb-4 text-lg font-bold text-[#1a1a2e]">🎯 Objectifs</h2>
        <form onSubmit={handleSaveGoals} className="space-y-3">
          {['calories', 'protein', 'carbs', 'fat'].map(f => (
            <div key={f} className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500 capitalize">{f}</span>
              <input type="number" value={goals[f]} onChange={e => setGoals({...goals, [f]: Number(e.target.value)})} className="w-20 p-2 rounded-lg border-2 border-gray-100 text-center text-sm font-bold outline-none focus:border-indigo-500" />
            </div>
          ))}
          <button type="submit" className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold mt-2 shadow-md shadow-emerald-50">Enregistrer</button>
        </form>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="m-0 mb-4 text-lg font-bold text-[#1a1a2e]">🔒 Sécurité</h2>
        {!showPinForm ? (
          <button onClick={() => setShowPinForm(true)} className="w-full bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-sm border-none cursor-pointer">Changer le code PIN</button>
        ) : (
          <form onSubmit={handleChangePin} className="space-y-3">
            <input type="password" inputMode="numeric" maxLength="4" placeholder="Code actuel" value={pinData.current} onChange={e => setPinData({...pinData, current: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-center tracking-[10px] text-lg outline-none focus:border-indigo-500" />
            <input type="password" inputMode="numeric" maxLength="4" placeholder="Nouveau code" value={pinData.new} onChange={e => setPinData({...pinData, new: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-center tracking-[10px] text-lg outline-none focus:border-indigo-500" />
            <input type="password" inputMode="numeric" maxLength="4" placeholder="Confirmer" value={pinData.confirm} onChange={e => setPinData({...pinData, confirm: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-center tracking-[10px] text-lg outline-none focus:border-indigo-500" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowPinForm(false)} className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-xl font-bold border-none">Annuler</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold border-none">Valider</button>
            </div>
          </form>
        )}
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h2 className="m-0 mb-4 text-lg font-bold text-[#1a1a2e]">💾 Sauvegarde</h2>
        <div className="grid grid-cols-1 gap-3">
          <button onClick={handleExport} className="bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold text-sm border-none">Exporter JSON</button>
          <label className="bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-sm text-center cursor-pointer">
            Importer JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { id: '/', icon: '🍽️', label: 'Repas', color: 'text-indigo-600' },
    { id: '/sport', icon: '💪', label: 'Sport', color: 'text-emerald-600' },
    { id: '/recipes', icon: '🧑‍🍳', label: 'Recettes', color: 'text-rose-600' },
    { id: '/evolution', icon: '📈', label: 'Évolution', color: 'text-amber-600' },
    { id: '/settings', icon: '⚙️', label: 'Profil', color: 'text-slate-600' }
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg flex justify-around py-3 pb-6 border-t border-gray-100 z-[100] rounded-t-[24px] shadow-2xl">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.id;
        return (
          <button key={tab.id} onClick={() => navigate(tab.id)} className={`flex-1 bg-transparent border-none flex flex-col items-center gap-1 transition-all ${isActive ? tab.color : 'text-gray-400'}`}>
            <span className={`text-xl ${isActive ? 'scale-110' : 'opacity-50 grayscale'}`}>{tab.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const AppContent = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('tracker_dark_mode') === 'true');
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    if (isUnlocked) {
      getEncrypted('tracker_onboarded', false).then(val => setHasOnboarded(val));
    }
  }, [isUnlocked]);

  useEffect(() => {
    localStorage.setItem('tracker_dark_mode', darkMode);
    if (darkMode) {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      document.body.style.background = '#111';
      if (!document.getElementById('dark-mode-fix')) {
        const style = document.createElement('style');
        style.id = 'dark-mode-fix';
        style.innerHTML = 'img, video, .recharts-responsive-container { filter: invert(1) hue-rotate(180deg); }';
        document.head.appendChild(style);
      }
    } else {
      document.documentElement.style.filter = 'none';
      document.body.style.background = '#f5f5f7';
      const style = document.getElementById('dark-mode-fix');
      if (style) style.remove();
    }
  }, [darkMode]);

  if (!isUnlocked) return <LockScreen onUnlock={() => setIsUnlocked(true)} />;
  if (hasOnboarded === null) return null;
  if (!hasOnboarded) return <Onboarding />;

  return (
    <div className="min-h-screen bg-transparent">
    <Routes>
      <Route path="/" element={<MealTracker />} />
      <Route path="/sport" element={<SportTracker />} />
      <Route path="/recipes" element={<RecipeBook />} />
      <Route path="/shopping" element={<ShoppingList />} /> {/* <-- NOUVELLE LIGNE */}
      <Route path="/evolution" element={<EvolutionTracker />} />
      <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
    </Routes>
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;