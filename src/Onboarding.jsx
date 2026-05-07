import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from './store/useUserStore';
import { saveEncrypted } from './encryptionUtils';

const Onboarding = () => {
  const navigate = useNavigate();
  const updateCalories = useUserStore((state) => state.updateCalories);
  
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activity: '1.2',
    goal: 'maintain'
  });

  const calculateTDEE = async (e) => {
    e.preventDefault();
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    const a = parseInt(formData.age);
    const today = new Date().toISOString().split('T')[0];
    
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += formData.gender === 'male' ? 5 : -161;
    let tdee = bmr * parseFloat(formData.activity);
    if (formData.goal === 'lose') tdee -= 500;
    if (formData.goal === 'gain') tdee += 300;
    
    const finalCalories = Math.round(tdee);
    const protein = Math.round(w * 2);
    const fat = Math.round(w * 1);
    const carbs = Math.round((finalCalories - (protein * 4) - (fat * 9)) / 4);

    const calculatedGoals = {
      calories: finalCalories,
      protein: protein,
      carbs: carbs > 0 ? carbs : 0,
      fat: fat
    };

    await saveEncrypted('tracker_goals', calculatedGoals);
    await saveEncrypted('tracker_weight', [{ date: today, weight: w }]);
    await saveEncrypted('tracker_measurements', [{ date: today, size: h }]);
    
    updateCalories(finalCalories);
    await saveEncrypted('tracker_onboarded', true);
    
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-white text-[#1a1a2e] rounded-[24px] p-8 w-full max-w-[400px] shadow-2xl">
        <div className="mb-6 text-center">
          <span className="text-4xl block mb-2">🎯</span>
          <h1 className="text-2xl font-black m-0">Profil Initial</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Calcul de vos objectifs</p>
        </div>
        <form onSubmit={calculateTDEE} className="space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.gender === 'male' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Homme</button>
            <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.gender === 'female' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Femme</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" min="0" required placeholder="Âge" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-center text-sm outline-none focus:border-indigo-500 bg-gray-50" />
            <input type="number" min="0" step="0.1" required placeholder="Poids (kg)" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-center text-sm outline-none focus:border-indigo-500 bg-gray-50" />
            <input type="number" min="0" required placeholder="Taille (cm)" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-center text-sm outline-none focus:border-indigo-500 bg-gray-50" />
          </div>
          <select value={formData.activity} onChange={e => setFormData({...formData, activity: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm outline-none focus:border-indigo-500 bg-gray-50 font-medium">
            <option value="1.2">Sédentaire (Bureau, pas de sport)</option>
            <option value="1.375">Léger (Sport 1-3x/semaine)</option>
            <option value="1.55">Modéré (Sport 3-5x/semaine)</option>
            <option value="1.725">Actif (Sport 6-7x/semaine)</option>
          </select>
          <select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm outline-none focus:border-indigo-500 bg-gray-50 font-medium">
            <option value="lose">Perte de poids (-500 kcal)</option>
            <option value="maintain">Maintien du poids</option>
            <option value="gain">Prise de masse (+300 kcal)</option>
          </select>
          <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-sm mt-2 shadow-lg shadow-emerald-200">
            Générer mon programme
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;