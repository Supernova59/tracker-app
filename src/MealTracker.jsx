import React, { useState, useMemo } from 'react';
import { ingredientsDB } from './ingredientsDB';
import BarcodeScanner from './BarcodeScanner';
import { useAsyncStorage } from './hooks/useAsyncStorage';
import MacroPill from './components/MacroPill';
import MealCard from './components/MealCard';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ORDER = ["Viandes", "Poissons & Mer", "Œufs & Végétal", "Féculents", "Légumes", "Fruits", "Laitiers", "Oléagineux", "Boissons", "Matières grasses", "Compléments", "Condiments"];
const DEFAULT_GOALS = { calories: 2500, protein: 160, carbs: 300, fat: 80 };

const MealTracker = () => {
  const [meals, setMeals, mealsLoaded] = useAsyncStorage('tracker_meals', []);
  const [recipes, setRecipes, recipesLoaded] = useAsyncStorage('tracker_recipes', []);
  const [customIngredients, setCustomIngredients, customLoaded] = useAsyncStorage('tracker_custom_ingredients', []);
  const [water, setWater, waterLoaded] = useAsyncStorage('tracker_water', {});
  const [goals, setGoals, goalsLoaded] = useAsyncStorage('tracker_goals', DEFAULT_GOALS);

  const [mealName, setMealName] = useState('');
  const [draftIngredients, setDraftIngredients] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState('');
  const [search, setSearch] = useState('');
  const [dateOffset, setDateOffset] = useState(0);

  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', category: 'Féculents', calories: '', protein: '', carbs: '', fat: '', unit: 'g' });

  const [showScanner, setShowScanner] = useState(false);
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);

  const allIngredients = useMemo(() => [...ingredientsDB, ...customIngredients], [customIngredients]);

  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + dateOffset);
  const targetDateStr = targetDateObj.toLocaleDateString('en-CA');
  const displayDateStr = dateOffset === 0 ? "Aujourd'hui" : dateOffset === -1 ? "Hier" : targetDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });

  const dailyMeals = meals.filter(m => m.date === targetDateStr);
  const todayWater = water[targetDateStr] || 0;

  const addWater = (amount) => {
    setWater({ ...water, [targetDateStr]: Math.max(0, todayWater + amount) });
  };

  const isRecipeSelected = selectedId.startsWith('recipe_');
  
  const selected = useMemo(() => {
    if (isRecipeSelected) return recipes.find(r => `recipe_${r.id}` === selectedId);
    return allIngredients.find(i => i.id === parseInt(selectedId));
  }, [selectedId, isRecipeSelected, recipes, allIngredients]);

  const isCountable = !isRecipeSelected && !!selected?.countInfo;
  const qtyPlaceholder = isCountable ? `Nbre de ${selected.countInfo.plural}` : 'Ex: 150';

  const filteredDB = useMemo(() => search.length > 0 ? allIngredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) : allIngredients, [search, allIngredients]);
  const grouped = useMemo(() => {
    const map = {};
    filteredDB.forEach(ing => { if (!map[ing.category]) map[ing.category] = []; map[ing.category].push(ing); });
    return map;
  }, [filteredDB]);

  const handleAdd = () => {
    if (!selected) return;
    if (isRecipeSelected) {
      const newIngs = selected.ingredients.map(ing => ({ ...ing, uniqueId: Date.now() + Math.random() }));
      setDraftIngredients([...draftIngredients, ...newIngs]);
      setSelectedId(''); return;
    }
    if (!qty) return;
    const qtyNum = parseFloat(qty);
    if (isNaN(qtyNum) || qtyNum <= 0) return;
    
    const actualGrams = isCountable ? qtyNum * selected.countInfo.gramsPerUnit : qtyNum;
    const displayQty = isCountable ? `${qtyNum} ${qtyNum > 1 ? selected.countInfo.plural : selected.countInfo.singular}` : `${qtyNum}${selected.unit}`;
    
    setDraftIngredients([...draftIngredients, {
      ...selected, uniqueId: Date.now() + Math.random(), displayQty,
      calcCalories: (selected.calories * actualGrams) / 100, calcProtein: (selected.protein * actualGrams) / 100,
      calcCarbs: (selected.carbs * actualGrams) / 100, calcFat: (selected.fat * actualGrams) / 100,
    }]);
    setSelectedId(''); setQty(''); setSearch('');
  };

  const handleCreateFood = (e) => {
    e.preventDefault();
    if (!newFood.name || !newFood.calories) return;
    const customFood = {
      id: Date.now(), name: newFood.name.trim() + " (Perso)", category: newFood.category,
      calories: parseFloat(newFood.calories), protein: parseFloat(newFood.protein || 0),
      carbs: parseFloat(newFood.carbs || 0), fat: parseFloat(newFood.fat || 0), unit: newFood.unit
    };
    setCustomIngredients([...customIngredients, customFood]);
    setShowAddFood(false);
    setNewFood({ name: '', category: 'Féculents', calories: '', protein: '', carbs: '', fat: '', unit: 'g' });
    setSelectedId(customFood.id.toString());
  };

  const handleRemoveDraft = (uid) => setDraftIngredients(draftIngredients.filter(i => i.uniqueId !== uid));

  const draftTotals = draftIngredients.reduce((acc, i) => ({
    calories: acc.calories + i.calcCalories, protein: acc.protein + i.calcProtein,
    carbs: acc.carbs + i.calcCarbs, fat: acc.fat + i.calcFat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleSave = () => {
    if (!mealName.trim() || draftIngredients.length === 0) return;
    setMeals([...meals, { id: Date.now(), date: targetDateStr, name: mealName.trim(), ingredients: draftIngredients, totals: draftTotals }]);
    setMealName(''); setDraftIngredients([]);
  };

  const handleSaveRecipe = () => {
    if (!mealName.trim() || draftIngredients.length === 0) return;
    setRecipes([...recipes, { id: Date.now(), name: mealName.trim(), ingredients: draftIngredients }]);
    alert(`La recette "${mealName.trim()}" a été ajoutée à vos favoris !`);
  };

  const handleDeleteMeal = (id) => setMeals(meals.filter(m => m.id !== id));

  const dailyTotals = dailyMeals.reduce((acc, m) => ({
    calories: acc.calories + m.totals.calories, protein: acc.protein + m.totals.protein,
    carbs: acc.carbs + m.totals.carbs, fat: acc.fat + m.totals.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const canAdd = !!selected && (isRecipeSelected || (!!qty && parseFloat(qty) > 0));
  const canSave = mealName.trim().length > 0 && draftIngredients.length > 0;

  const handleScanResult = async (barcode) => {
    setShowScanner(false);
    setIsSearchingAPI(true);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1) {
        const p = data.product;
        const nutriments = p.nutriments;
        setNewFood({
          name: p.product_name_fr || p.product_name || '', category: 'Compléments',
          calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || '',
          protein: nutriments.proteins_100g || 0, carbs: nutriments.carbohydrates_100g || 0,
          fat: nutriments.fat_100g || 0, unit: 'g'
        });
        setShowAddFood(true);
      } else {
        alert("Produit introuvable dans la base de données OpenFoodFacts.");
      }
    } catch (error) {
      alert("Erreur de connexion. Vérifie ton réseau.");
    } finally {
      setIsSearchingAPI(false);
    }
  };

  if (!mealsLoaded || !recipesLoaded || !customLoaded || !waterLoaded || !goalsLoaded) {
    return <div className="p-4 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="font-sans bg-[#f5f5f7] min-h-screen p-4 max-w-[480px] mx-auto pb-20"
    >
      <AnimatePresence>
        {showAddFood && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.form 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onSubmit={handleCreateFood} 
              className="bg-white p-7 rounded-[20px] w-full max-w-[420px] shadow-xl m-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-xl font-bold text-[#1a1a2e]">Créer un aliment</h3>
                <button type="button" onClick={() => setShowAddFood(false)} className="bg-transparent border-none text-2xl cursor-pointer text-gray-400 p-0">✕</button>
              </div>
              <div className="flex flex-col gap-4">
                <input type="text" placeholder="Nom (ex: Pâte à pizza)" required value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} className="p-3 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500" />
                <div className="flex gap-2">
                  <select value={newFood.category} onChange={e => setNewFood({...newFood, category: e.target.value})} className="flex-2 w-full p-3 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500">
                    {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newFood.unit} onChange={e => setNewFood({...newFood, unit: e.target.value})} className="flex-1 w-full p-3 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:border-indigo-500">
                    <option value="g">g</option><option value="ml">ml</option>
                  </select>
                </div>
                <div className="p-3.5 bg-indigo-50 rounded-xl border-2 border-indigo-100">
                  <p className="m-0 mb-3 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Valeurs pour 100{newFood.unit}</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input type="number" placeholder="Calories *" required min="0" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: e.target.value})} className="p-2.5 rounded-lg border-2 border-gray-200 text-sm bg-white focus:border-indigo-500 outline-none" />
                    <input type="number" placeholder="Protéines (g)" min="0" value={newFood.protein} onChange={e => setNewFood({...newFood, protein: e.target.value})} className="p-2.5 rounded-lg border-2 border-gray-200 text-sm bg-white focus:border-indigo-500 outline-none" />
                    <input type="number" placeholder="Glucides (g)" min="0" value={newFood.carbs} onChange={e => setNewFood({...newFood, carbs: e.target.value})} className="p-2.5 rounded-lg border-2 border-gray-200 text-sm bg-white focus:border-indigo-500 outline-none" />
                    <input type="number" placeholder="Lipides (g)" min="0" value={newFood.fat} onChange={e => setNewFood({...newFood, fat: e.target.value})} className="p-2.5 rounded-lg border-2 border-gray-200 text-sm bg-white focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <button type="submit" className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-none p-3.5 rounded-xl font-bold cursor-pointer text-sm tracking-wide">Sauvegarder l'aliment</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {showScanner && (
        <BarcodeScanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />
      )}

      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-[20px] p-5 mb-3.5 shadow-lg">
        <div className="flex justify-between items-center mb-4 bg-white/10 px-3 py-1.5 rounded-xl">
          <button onClick={() => setDateOffset(d => d - 1)} className="bg-transparent border-none text-white text-lg cursor-pointer">◄</button>
          <span className="text-white font-bold text-sm capitalize">{displayDateStr}</span>
          <button onClick={() => setDateOffset(d => d + 1)} disabled={dateOffset >= 0} className={`bg-transparent border-none text-white text-lg ${dateOffset >= 0 ? 'opacity-20 cursor-default' : 'cursor-pointer'}`}>►</button>
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="m-0 mb-1 text-xs font-semibold text-indigo-400 uppercase">Calories</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-white leading-none">{Math.round(dailyTotals.calories)}</span>
              <span className="text-sm font-medium text-slate-400">/ {goals.calories}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold ${dailyTotals.calories > goals.calories ? 'text-red-400' : 'text-emerald-400'}`}>{Math.abs(Math.round(goals.calories - dailyTotals.calories))} kcal</span>
            <span className="block text-[11px] text-gray-400">{dailyTotals.calories > goals.calories ? 'en trop' : 'restantes'}</span>
          </div>
        </div>
        
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((dailyTotals.calories / goals.calories) * 100, 100)}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
            className={`h-full ${dailyTotals.calories > goals.calories ? 'bg-red-400' : 'bg-indigo-400'}`}
          />
        </div>
        
        <div className="flex gap-2">
          <MacroPill label="Protéines" value={dailyTotals.protein} goal={goals.protein} colorHex="#10b981" bgClass="bg-emerald-500/15" textClass="text-emerald-400" />
          <MacroPill label="Glucides"  value={dailyTotals.carbs}   goal={goals.carbs}   colorHex="#fbbf24" bgClass="bg-amber-500/15"   textClass="text-amber-400" />
          <MacroPill label="Lipides"   value={dailyTotals.fat}     goal={goals.fat}     colorHex="#f43f5e" bgClass="bg-rose-500/15"    textClass="text-rose-400" />
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.98 }} className="bg-white rounded-[20px] p-4 mb-3.5 flex items-center shadow-sm border border-gray-50">
        <div className="w-7 h-[70px] bg-gray-100 rounded-[14px] overflow-hidden mr-4 relative flex items-end">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${Math.min((todayWater / 8) * 100, 100)}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            className="w-full bg-gradient-to-b from-blue-400 to-blue-500"
          />
        </div>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <p className="m-0 text-sm font-bold text-[#1a1a2e]">Hydratation</p>
            <p className="m-0 mt-0.5 text-xs text-gray-500">
              {todayWater} / 8 verres <br/>
              <span className="text-[11px]">({(todayWater * 0.25).toFixed(2)} L)</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => addWater(-1)} disabled={todayWater === 0} className={`w-9 h-9 rounded-full border-none flex items-center justify-center text-lg ${todayWater === 0 ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-gray-100 text-gray-600 cursor-pointer'}`}>-</button>
            <button onClick={() => addWater(1)} className="w-9 h-9 rounded-full border-none bg-blue-50 text-blue-500 flex items-center justify-center text-lg cursor-pointer">+</button>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-[20px] p-4.5 mb-3.5 shadow-sm border border-gray-50">
        <p className="m-0 mb-3 text-sm font-bold text-[#1a1a2e]">Composer un repas</p>
        
        <input type="text" value={mealName} onChange={e => setMealName(e.target.value)} placeholder="Nom du repas (ex: Bowl Poulet)" className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm mb-3 bg-gray-50 focus:border-indigo-500 outline-none box-border" />
        
        <div className="bg-slate-50 border-2 border-gray-200 rounded-xl p-3 mb-3">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setSearch(''); }} className="w-full border-2 border-gray-200 rounded-lg py-2 pr-2.5 pl-8 text-xs bg-white focus:border-indigo-500 outline-none appearance-none">
                <option value="">+ Aliments / Favoris</option>
                {!search && recipes.length > 0 && (
                  <optgroup label="⭐ Mes Plats Favoris">
                    {recipes.map(r => <option key={r.id} value={`recipe_${r.id}`}>{r.name}</option>)}
                  </optgroup>
                )}
                {search.length > 0 ? filteredDB.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>) : CATEGORY_ORDER.map(cat => {
                  const items = grouped[cat];
                  if (!items) return null;
                  return <optgroup key={cat} label={cat}>{items.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}</optgroup>;
                })}
              </select>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setSelectedId(''); }} placeholder="Rechercher..." className={`absolute left-8 top-0 w-[calc(100%-40px)] h-full border-none bg-transparent text-xs outline-none ${search ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setShowScanner(true)} className="bg-emerald-500 text-white border-none rounded-lg px-3 text-xs font-bold cursor-pointer flex items-center">
                {isSearchingAPI ? "..." : "Scan"}
              </button>
              <button onClick={() => setShowAddFood(true)} className="bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg px-3 text-lg font-bold cursor-pointer flex items-center">+</button>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {!isRecipeSelected && (
              <div className="flex-1 relative">
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} onKeyDown={e => e.key === 'Enter' && canAdd && handleAdd()} placeholder={qtyPlaceholder} min="0" className="w-full border-2 border-gray-200 rounded-lg p-2 text-xs focus:border-indigo-500 outline-none box-border" />
                {selected && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400">{isCountable ? selected.countInfo.plural : selected.unit}</span>}
              </div>
            )}
            <button onClick={handleAdd} disabled={!canAdd} className={`${isRecipeSelected ? 'w-full' : 'w-auto'} ${canAdd ? 'bg-indigo-600 text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} border-none rounded-lg py-2 px-4 text-xs font-bold transition-colors`}>
              + Ajouter {isRecipeSelected ? "ce plat" : ""}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {draftIngredients.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <ul className="list-none p-0 m-0 mb-2.5 flex flex-col gap-1">
                <AnimatePresence>
                  {draftIngredients.map(ing => (
                    <motion.li 
                      key={ing.uniqueId} 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between bg-slate-50 rounded-lg py-1.5 px-2.5 border border-gray-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-gray-700">{ing.displayQty} {ing.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-indigo-600">{Math.round(ing.calcCalories)} kcal</span>
                        <button onClick={() => handleRemoveDraft(ing.uniqueId)} className="bg-transparent border-none text-gray-300 cursor-pointer p-1">✕</button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <div className="flex gap-2 mt-3">
                <button onClick={handleSaveRecipe} disabled={!canSave} className={`flex-1 border-none rounded-xl p-3 text-xs font-bold transition-colors ${canSave ? 'bg-amber-100 text-amber-700 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>⭐ Recette</button>
                <button onClick={handleSave} disabled={!canSave} className={`flex-2 border-none rounded-xl p-3 text-sm font-bold transition-colors ${canSave ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Valider ce repas ✅</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <p className="m-0 mb-2.5 ml-0.5 text-sm font-bold text-[#1a1a2e]">Repas du {displayDateStr}</p>
        {dailyMeals.length === 0 ? (
          <div className="text-center py-7 px-4 text-gray-400 bg-white rounded-2xl text-xs shadow-sm border border-gray-50">Aucun repas enregistré pour ce jour.</div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {dailyMeals.map(meal => (
                <motion.div key={meal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <MealCard meal={meal} onDelete={handleDeleteMeal} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default MealTracker;