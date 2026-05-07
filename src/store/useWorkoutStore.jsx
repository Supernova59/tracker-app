import { create } from 'zustand';
import { getEncrypted, saveEncrypted } from '../encryptionUtils';

export const useWorkoutStore = create((set, get) => ({
  routines: [],
  
  fetchRoutines: async () => {
    const saved = await getEncrypted('tracker_routines', []);
    set({ routines: saved });
  },

  addRoutine: async (newRoutine) => {
    const updatedRoutines = [...get().routines, newRoutine];
    await saveEncrypted('tracker_routines', updatedRoutines);
    set({ routines: updatedRoutines });
  },

  applyRoutineToSession: (routine, currentExercises) => {
    return [...currentExercises, ...routine.exercises];
  }
}));