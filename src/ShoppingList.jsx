import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEncrypted, saveEncrypted } from './encryptionUtils';

const ShoppingList = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [selectedPortions, setSelectedPortions] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);

  // Charger les recettes au montage
  useEffect(() => {
    const loadRecipes = async () => {
      const savedRecipes = await getEncrypted('tracker_recipes', []);
      setRecipes(savedRecipes);
    };
    loadRecipes();
  }, []);

  // Mettre à jour la portion d'une recette
  const updatePortion = (recipeId, change) => {
    setSelectedPortions(prev => {
      const current = prev[recipeId] || 0;
      const newValue = Math.max(0, current + change);
      return { ...prev, [recipeId]: newValue };
    });
  };

  // Générer la liste avec le fameux .reduce() corrigé
  const generateList = () => {
    const itemsToBuy = [];

    // On prépare un tableau plat avec tous les ingrédients multipliés par les portions
    recipes.forEach(recipe => {
      const portions = selectedPortions[recipe.id] || 0;
      if (portions > 0 && recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          itemsToBuy.push({
            name: ing.name,
            qty: (ing.qty || 0) * portions,
            unit: ing.unit || 'g'
          });
        });
      }
    });

    // On fusionne les doublons
    const finalArray = itemsToBuy.reduce((caddie, current) => {
      const existing = caddie.find(item => item.name.toLowerCase() === current.name.toLowerCase());
      if (existing) {
        existing.qty += current.qty;
      } else {
        caddie.push({ ...current });
      }
      return caddie;
    }, []);

    setShoppingList(finalArray);
    setCheckedItems([]); // On réinitialise les cases cochées
  };

  const toggleCheck = (index) => {
    setCheckedItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 font-sans pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
        <button onClick={() => navigate('/recipes')} className="bg-gray-100 text-gray-600 w-10 h-10 rounded-xl font-bold flex items-center justify-center border-none">
          ←
        </button>
        <h1 className="text-xl font-black text-[#1a1a2e] m-0">🛒 Ma Liste</h1>
      </div>

      {/* SÉLECTION DES RECETTES */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">1. Prévus cette semaine</h2>
        
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucune recette sauvegardée.</p>
        ) : (
          <div className="space-y-3">
            {recipes.map(recipe => (
              <div key={recipe.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="font-semibold text-sm text-gray-700 truncate pr-2">{recipe.name}</span>
                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm shrink-0">
                  <button onClick={() => updatePortion(recipe.id, -1)} className="text-rose-500 font-bold px-2 py-1 border-none bg-transparent">-</button>
                  <span className="font-black text-sm w-4 text-center">{selectedPortions[recipe.id] || 0}</span>
                  <button onClick={() => updatePortion(recipe.id, 1)} className="text-emerald-500 font-bold px-2 py-1 border-none bg-transparent">+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={generateList}
          disabled={Object.values(selectedPortions).every(v => v === 0)}
          className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed border-none"
        >
          Générer la liste
        </button>
      </div>

      {/* RÉSULTAT : LA LISTE FUSIONNÉE */}
      {shoppingList.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">2. Au supermarché</h2>
          <div className="space-y-2">
            {shoppingList.map((item, index) => {
              const isChecked = checkedItems.includes(index);
              return (
                <div 
                  key={index} 
                  onClick={() => toggleCheck(index)}
                  className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${isChecked ? 'bg-gray-50 border-transparent opacity-50' : 'bg-white border-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}>
                      {isChecked && '✓'}
                    </div>
                    <span className={`font-semibold text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="font-black text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {Math.round(item.qty * 10) / 10} {item.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;