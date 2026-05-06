export const exercisesDB = [
  // 💪 Musculation Haut du corps
  { id: 1,  name: "Développé couché (Barre)", baseName: "Développé couché", variant: "Barre", category: "Musculation", muscle: "Pectoraux", type: "Poids" },
  { id: 2,  name: "Développé incliné (Haltères)", baseName: "Développé incliné", variant: "Haltères", category: "Musculation", muscle: "Pectoraux", type: "Poids" },
  { id: 3,  name: "Tirage poitrine", baseName: "Tirage poitrine", variant: null, category: "Musculation", muscle: "Dos", type: "Poids" },
  { id: 4,  name: "Rowing barre", baseName: "Rowing", variant: "Barre", category: "Musculation", muscle: "Dos", type: "Poids" },
  { id: 5,  name: "Développé militaire", baseName: "Développé militaire", variant: null, category: "Musculation", muscle: "Épaules", type: "Poids" },
  { id: 6,  name: "Curl biceps (Haltères)", baseName: "Curl biceps", variant: "Haltères", category: "Musculation", muscle: "Biceps", type: "Poids" },
  { id: 7,  name: "Extension triceps à la poulie", baseName: "Extension triceps", variant: "Poulie", category: "Musculation", muscle: "Triceps", type: "Poids" },
  
  // 🦵 Musculation Bas du corps
  { id: 8,  name: "Squat (Barre)", baseName: "Squat", variant: "Barre", category: "Musculation", muscle: "Quadriceps", type: "Poids" },
  { id: 9,  name: "Presse à cuisses", baseName: "Presse à cuisses", variant: null, category: "Musculation", muscle: "Quadriceps", type: "Poids" },
  { id: 10, name: "Fentes (Haltères)", baseName: "Fentes", variant: "Haltères", category: "Musculation", muscle: "Quadriceps", type: "Poids" },
  { id: 11, name: "Soulevé de terre", baseName: "Soulevé de terre", variant: null, category: "Musculation", muscle: "Ischio", type: "Poids" },
  { id: 12, name: "Leg Extension", baseName: "Leg Extension", variant: null, category: "Musculation", muscle: "Quadriceps", type: "Poids" },
  { id: 13, name: "Leg Curl", baseName: "Leg Curl", variant: null, category: "Musculation", muscle: "Ischio", type: "Poids" },
  
  // 🏃 Cardio
  { id: 14, name: "Course sur tapis", baseName: "Course", variant: "Tapis", category: "Cardio", muscle: "Full body", type: "Temps" },
  { id: 15, name: "Vélo elliptique", baseName: "Vélo elliptique", variant: null, category: "Cardio", muscle: "Full body", type: "Temps" },
  { id: 16, name: "Rameur", baseName: "Rameur", variant: null, category: "Cardio", muscle: "Full body", type: "Temps" },
  { id: 17, name: "Corde à sauter", baseName: "Corde à sauter", variant: null, category: "Cardio", muscle: "Full body", type: "Temps" },
  { id: 18, name: "Marche rapide", baseName: "Marche rapide", variant: null, category: "Cardio", muscle: "Full body", type: "Temps" },
  
  // 🤸 Bodyweight / Calisthenics
  { id: 19, name: "Pompes", baseName: "Pompes", variant: "Standard", category: "Bodyweight", muscle: "Pectoraux", type: "Reps" },
  { id: 20, name: "Tractions (Pull-ups)", baseName: "Tractions", variant: "Pull-ups", category: "Bodyweight", muscle: "Dos", type: "Reps" },
  { id: 21, name: "Dips", baseName: "Dips", variant: null, category: "Bodyweight", muscle: "Triceps", type: "Reps" },
  { id: 22, name: "Squats poids de corps", baseName: "Squat", variant: "Poids de corps", category: "Bodyweight", muscle: "Quadriceps", type: "Reps" },
  { id: 23, name: "Fentes poids de corps", baseName: "Fentes", variant: "Poids de corps", category: "Bodyweight", muscle: "Quadriceps", type: "Reps" },
  { id: 24, name: "Crunchs", baseName: "Crunchs", variant: null, category: "Bodyweight", muscle: "Abdos", type: "Reps" },
  { id: 25, name: "Relevés de jambes suspendus", baseName: "Relevés de jambes", variant: "Suspendus", category: "Bodyweight", muscle: "Abdos", type: "Reps" },
  { id: 26, name: "Gainage (Planche)", baseName: "Gainage", variant: "Planche", category: "Bodyweight", muscle: "Abdos", type: "Temps" },
  { id: 27, name: "Burpees", baseName: "Burpees", variant: null, category: "Bodyweight", muscle: "Full body", type: "Reps" },
  { id: 28, name: "Mountain Climbers", baseName: "Mountain Climbers", variant: null, category: "Bodyweight", muscle: "Full body", type: "Reps" },
  { id: 29, name: "Jumping Jacks", baseName: "Jumping Jacks", variant: null, category: "Bodyweight", muscle: "Full body", type: "Reps" },
  { id: 30, name: "Pistol Squat", baseName: "Pistol Squat", variant: null, category: "Bodyweight", muscle: "Quadriceps", type: "Reps" },
  { id: 31, name: "Pike Push-ups", baseName: "Pike Push-ups", variant: null, category: "Bodyweight", muscle: "Épaules", type: "Reps" },
  { id: 32, name: "Chin-ups", baseName: "Tractions", variant: "Chin-ups", category: "Bodyweight", muscle: "Biceps", type: "Reps" },
  { id: 33, name: "Pompes diamant", baseName: "Pompes", variant: "Diamant", category: "Bodyweight", muscle: "Triceps", type: "Reps" }
];

export const ROUTINES = {
  "Push (Pecs, Épaules, Triceps)": [1, 2, 5, 7],
  "Pull (Dos, Biceps)": [3, 4, 6],
  "Legs (Jambes)": [8, 9, 10, 12, 13],
  "Calisthenics": [19, 20, 21, 22, 26],
};