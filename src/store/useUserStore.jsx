import { create } from 'zustand';

export const useUserStore = create((set) => ({
  caloriesGoal: 2500,
  userName: "TestUser",
  
  updateCalories: (newCalories) => set({ caloriesGoal: newCalories }),
  updateName: (newName) => set({ userName: newName }),
}));