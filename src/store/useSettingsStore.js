import { create } from 'zustand';

export const useSettingsStore = create((set) => ({
  lang: localStorage.getItem('tracker_lang') || 'fr',
  setLang: (newLang) => {
    localStorage.setItem('tracker_lang', newLang);
    set({ lang: newLang });
  }
}));
