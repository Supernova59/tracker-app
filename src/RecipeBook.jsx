import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RECIPES = [
  // --- SMOOTHIES & SHAKES (10) ---
  { id: 1, category: "Smoothies & Shakes", name: "Gainer Maison", prep: "5 min", ingredients: ["100g Flocons d'avoine", "1 Banane", "30g Whey", "300ml Lait entier", "1 c.à.s Beurre de cacahuète"], instructions: ["Verser le lait au fond du blender.", "Ajouter l'avoine, la banane, la whey et le beurre de cacahuète.", "Mixer 60 secondes à pleine puissance.", "Boire bien frais."] },
  { id: 2, category: "Smoothies & Shakes", name: "Smoothie Vert Détox", prep: "5 min", ingredients: ["1 Poignée d'épinards frais", "1/2 Concombre", "1 Pomme verte", "Jus d'un demi citron", "200ml Eau de coco"], instructions: ["Éplucher le concombre et épépiner la pomme.", "Placer tous les ingrédients dans le blender.", "Mixer jusqu'à disparition des morceaux verts.", "Servir avec des glaçons."] },
  { id: 3, category: "Smoothies & Shakes", name: "Shake Fruits Rouges", prep: "5 min", ingredients: ["150g Fruits rouges surgelés", "200ml Lait d'amande", "30g Whey Vanille", "1 c.à.s Graines de chia"], instructions: ["Mettre les fruits rouges surgelés dans le blender.", "Verser le lait et ajouter la whey et les graines.", "Mixer longuement pour broyer les fruits surgelés."] },
  { id: 4, category: "Smoothies & Shakes", name: "Choco-Peanut Punch", prep: "5 min", ingredients: ["250ml Lait", "30g Whey Chocolat", "1 grosse c.à.s Beurre de cacahuète", "1 pincée de Cacao amer"], instructions: ["Tout placer dans le blender avec 3 glaçons.", "Mixer à pleine puissance.", "Saupoudrer d'un peu de cacao amer sur le dessus avant de boire."] },
  { id: 5, category: "Smoothies & Shakes", name: "Shake Énergie Café", prep: "5 min", ingredients: ["1 Expresso froid", "200ml Lait (ou lait végétal)", "1 Banane", "30g Whey Vanille", "30g Flocons d'avoine"], instructions: ["Préparer un expresso et le laisser refroidir (ou ajouter des glaçons).", "Mélanger le café froid avec le lait, l'avoine, la banane et la whey.", "Mixer finement."] },
  { id: 6, category: "Smoothies & Shakes", name: "Smoothie Fraise Banane", prep: "5 min", ingredients: ["150g Fraises", "1 Banane", "200ml Lait d'amande", "1 c.à.s Graines de lin"], instructions: ["Laver et équeuter les fraises.", "Mixer tous les ingrédients jusqu'à obtenir une texture onctueuse.", "Déguster très frais."] },
  { id: 7, category: "Smoothies & Shakes", name: "Masse Beurre de Cacahuète", prep: "5 min", ingredients: ["350ml Lait", "80g Flocons d'avoine", "2 c.à.s Beurre de cacahuète", "1 c.à.c Miel", "30g Whey Chocolat"], instructions: ["Mettre tous les ingrédients dans le blender.", "Mixer au moins 1 minute pour bien pulvériser l'avoine.", "Ajouter un peu d'eau si la texture est trop épaisse."] },
  { id: 8, category: "Smoothies & Shakes", name: "Shake Vert Protéiné", prep: "5 min", ingredients: ["1 Poignée d'épinards", "1 c.à.c Spiruline", "250ml Lait de soja", "30g Whey Vanille"], instructions: ["Verser le lait dans le blender.", "Ajouter les épinards, la spiruline et la whey.", "Mixer fortement pour bien intégrer les épinards."] },
  { id: 9, category: "Smoothies & Shakes", name: "Smoothie Mangue Passion", prep: "5 min", ingredients: ["1/2 Mangue", "1 Fruit de la passion", "200ml Eau de coco", "30g Whey Vanille"], instructions: ["Couper la mangue en dés.", "Vider le fruit de la passion dans le blender.", "Ajouter l'eau de coco et la whey, puis mixer."] },
  { id: 10, category: "Smoothies & Shakes", name: "Café Glacé Protéiné", prep: "5 min", ingredients: ["1 Double expresso", "200ml Lait d'amande", "1 Poignée de glaçons", "30g Whey Vanille"], instructions: ["Mettre les glaçons dans le blender.", "Verser le lait, le café et la whey.", "Mixer jusqu'à obtenir une texture frappée type milkshake."] },

  // --- PLATS DE RÉSISTANCE (15) ---
  { id: 11, category: "Plats", name: "Poulet Curry & Coco", prep: "20 min", ingredients: ["200g Blanc de poulet", "150g Riz basmati", "10cl Lait de coco", "1 c.à.c Curry", "1/2 Oignon"], instructions: ["Cuire le riz basmati.", "Faire dorer l'oignon et le poulet en dés dans une poêle huilée.", "Ajouter le curry, bien mélanger.", "Verser le lait de coco et laisser mijoter 5 minutes."] },
  { id: 12, category: "Plats", name: "Pâtes au Saumon", prep: "15 min", ingredients: ["150g Pâtes", "150g Pavé de saumon", "2 c.à.s Crème légère", "Aneth", "Citron"], instructions: ["Cuire les pâtes al dente.", "Couper le saumon en dés et le saisir à la poêle 3 min.", "Ajouter la crème, l'aneth et le citron. Chauffer 1 min.", "Mélanger avec les pâtes égouttées."] },
  { id: 13, category: "Plats", name: "Chili Con Carne Express", prep: "25 min", ingredients: ["150g Boeuf haché 5%", "150g Haricots rouges (conserve)", "100g Coulis de tomate", "Épices Chili", "1/2 Oignon rouge"], instructions: ["Faire revenir l'oignon et le boeuf dans une poêle.", "Ajouter les épices chili et cuire 2 minutes.", "Verser le coulis de tomate et les haricots rouges rincés.", "Laisser mijoter à feu doux pendant 10 minutes."] },
  { id: 14, category: "Plats", name: "Bowl Patate Douce & Boeuf", prep: "30 min", ingredients: ["200g Patate douce", "150g Steak haché 5%", "1 Poignée de jeunes pousses", "1/2 Avocat", "Graines de sésame"], instructions: ["Couper la patate douce en cubes et cuire au four (20 min à 200°C) avec des épices.", "Cuire le steak haché émietté à la poêle.", "Dresser dans un bol : pousses, patate douce, boeuf et tranches d'avocat.", "Parsemer de sésame."] },
  { id: 15, category: "Plats", name: "Wok Tofu & Légumes", prep: "20 min", ingredients: ["150g Tofu ferme", "200g Mélange légumes asiatiques", "2 c.à.s Sauce soja salée", "1 c.à.s Huile de sésame", "Nouilles de riz"], instructions: ["Presser le tofu pour enlever l'eau, puis le couper en dés.", "Faire sauter le tofu au wok avec l'huile de sésame jusqu'à ce qu'il soit croustillant.", "Ajouter les légumes et la sauce soja, sauter 5 min.", "Mélanger avec les nouilles cuites."] },
  { id: 16, category: "Plats", name: "Salade Quinoa Poulet", prep: "15 min", ingredients: ["100g Quinoa cru", "150g Poulet rôti", "Tomates cerises", "1/2 Avocat", "Vinaigrette légère"], instructions: ["Cuire le quinoa puis le laisser refroidir.", "Couper les tomates, l'avocat et le poulet en morceaux.", "Mélanger tous les ingrédients dans un saladier.", "Ajouter la vinaigrette et servir frais."] },
  { id: 17, category: "Plats", name: "Wrap Thon Crudités", prep: "10 min", ingredients: ["1 Grande galette de blé entier", "100g Thon au naturel", "Salade verte", "Maïs", "1 c.à.s Yaourt nature ou Fromage blanc"], instructions: ["Mélanger le thon égoutté avec le yaourt.", "Étaler la préparation sur la galette.", "Ajouter la salade et le maïs.", "Rouler la galette fermement et couper en deux."] },
  { id: 18, category: "Plats", name: "Omelette Protéinée", prep: "10 min", ingredients: ["3 Oeufs entiers", "50g Dés de dinde", "1 Poignée d'épinards", "30g Fromage râpé allégé"], instructions: ["Battre les oeufs dans un bol avec sel et poivre.", "Faire revenir les épinards et la dinde 1 minute à la poêle.", "Verser les oeufs battus par-dessus.", "Ajouter le fromage avant de replier l'omelette."] },
  { id: 19, category: "Plats", name: "Riz Dinde Teriyaki", prep: "20 min", ingredients: ["150g Escalope de dinde", "150g Riz", "3 c.à.s Sauce Teriyaki", "Brocoli"], instructions: ["Lancer la cuisson du riz et du brocoli à la vapeur.", "Couper la dinde en lamelles et la cuire à la poêle.", "En fin de cuisson, ajouter la sauce teriyaki pour laquer la viande.", "Servir la dinde sur le riz avec le brocoli à côté."] },
  { id: 20, category: "Plats", name: "Steak Végétal & Lentilles", prep: "15 min", ingredients: ["1 Steak de soja ou blé", "150g Lentilles corail", "1 Carotte", "Cumin"], instructions: ["Cuire les lentilles corail avec la carotte coupée en petits dés et du cumin (12 min).", "Faire dorer le steak végétal à la poêle 3 min par face.", "Servir chaud ensemble."] },
  { id: 21, category: "Plats", name: "Bowl Saumon Avocat", prep: "15 min", ingredients: ["150g Riz vinaigré (ou basmati)", "150g Saumon frais (qualité sushi)", "1/2 Avocat", "Graines de sésame", "Sauce soja"], instructions: ["Disposer le riz cuit et refroidi au fond d'un bol.", "Couper le saumon cru et l'avocat en cubes réguliers.", "Les placer sur le riz, saupoudrer de sésame.", "Arroser d'un filet de sauce soja juste avant de manger."] },
  { id: 22, category: "Plats", name: "Poulet Moutarde & Riz", prep: "20 min", ingredients: ["200g Poulet", "150g Riz", "2 c.à.s Crème légère 4%", "1 c.à.s Moutarde à l'ancienne"], instructions: ["Cuire le riz.", "Saisir le poulet en cubes à la poêle.", "Baisser le feu, mélanger la crème et la moutarde puis verser sur le poulet.", "Laisser chauffer 2 minutes et servir avec le riz."] },
  { id: 23, category: "Plats", name: "Gratin Pâtes Poulet Brocoli", prep: "35 min", ingredients: ["150g Pâtes complètes", "150g Poulet cuit", "Brocoli", "Béchamel allégée (ou crème légère)", "Gruyère"], instructions: ["Précuire les pâtes et les fleurettes de brocoli 5 minutes.", "Mélanger pâtes, brocoli et morceaux de poulet dans un plat à gratin.", "Napper de béchamel légère et de gruyère.", "Gratiner au four 15 minutes à 200°C."] },
  { id: 24, category: "Plats", name: "Couscous Express Poulet", prep: "15 min", ingredients: ["100g Semoule complète", "150g Aiguillettes de poulet", "200g Mélange légumes pour couscous (conserve ou surgelé)", "Épices Ras el hanout"], instructions: ["Réhydrater la semoule avec de l'eau bouillante salée.", "Cuire le poulet avec les épices dans une poêle ou cocotte.", "Ajouter les légumes égouttés pour les réchauffer avec la viande.", "Servir sur la semoule."] },
  { id: 25, category: "Plats", name: "Burger Maison Allégé", prep: "20 min", ingredients: ["1 Pain à burger complet", "1 Steak haché 5%", "Salade et Tomate en rondelles", "1 Tranche de Cheddar", "Sauce Yaourt & Moutarde"], instructions: ["Faire dorer le pain au four ou grille-pain.", "Cuire le steak à la poêle et faire fondre le cheddar dessus en fin de cuisson.", "Tartiner le pain de la sauce yaourt-moutarde.", "Monter le burger : salade, tomate, viande, pain."] },

  // --- COLLATIONS & SNACKS (10) ---
  { id: 26, category: "Snacks", name: "Tartine Banane Peanut", prep: "3 min", ingredients: ["2 Tranches de pain complet", "1 Banane", "2 c.à.s Beurre de cacahuète", "Graines de chia"], instructions: ["Faire toaster le pain.", "Étaler généreusement le beurre de cacahuète.", "Disposer des rondelles de banane par-dessus.", "Saupoudrer de graines de chia."] },
  { id: 27, category: "Snacks", name: "Houmous & Carottes", prep: "5 min", ingredients: ["3 Carottes", "3 grosses c.à.s Houmous", "Paprika", "Un filet d'huile d'olive"], instructions: ["Éplucher les carottes et les couper en bâtonnets.", "Disposer le houmous dans un petit ramequin.", "Ajouter un trait d'huile d'olive et du paprika sur le houmous.", "Tremper et déguster."] },
  { id: 28, category: "Snacks", name: "Bol Fromage Blanc & Amandes", prep: "2 min", ingredients: ["200g Fromage blanc 0% ou Skyr", "1 Poignée d'amandes (30g)", "1 c.à.c Miel"], instructions: ["Verser le fromage blanc dans un bol.", "Concasser grossièrement les amandes et les ajouter au-dessus.", "Arroser avec la cuillère de miel."] },
  { id: 29, category: "Snacks", name: "Energy Balls Express", prep: "10 min", ingredients: ["100g Dattes dénoyautées", "50g Amandes", "20g Flocons d'avoine", "1 c.à.s Cacao poudre"], instructions: ["Placer tous les ingrédients dans un mixeur puissant.", "Mixer par à-coups jusqu'à obtenir une pâte collante.", "Former des petites boules avec les mains.", "Placer au frigo 30 min avant de manger."] },
  { id: 30, category: "Snacks", name: "Oeufs Durs & Noix", prep: "10 min", ingredients: ["2 Oeufs", "30g Cerneaux de noix", "Sel, Poivre"], instructions: ["Faire bouillir une casserole d'eau.", "Plonger les oeufs délicatement pendant 9 à 10 minutes.", "Les refroidir sous l'eau froide puis les écaler.", "Déguster avec les noix pour un apport optimal en protéines et bons lipides."] },
  { id: 31, category: "Snacks", name: "Pomme & Beurre d'Amande", prep: "2 min", ingredients: ["1 Pomme", "2 c.à.s Beurre d'amande"], instructions: ["Couper la pomme en quartiers en retirant le trognon.", "Mettre le beurre d'amande dans un petit récipient.", "Tremper les morceaux de pomme dans le beurre d'amande."] },
  { id: 32, category: "Snacks", name: "Barre Protéinée Maison", prep: "15 min (repos 2h)", ingredients: ["150g Flocons d'avoine", "60g Whey Vanille", "3 c.à.s Miel", "3 c.à.s Beurre de cacahuète", "Un peu d'eau"], instructions: ["Mélanger les ingrédients secs dans un grand bol.", "Ajouter le miel et le beurre de cacahuète, pétrir à la main. Ajouter un filet d'eau si trop sec.", "Tasser la préparation dans un plat rectangulaire recouvert de papier sulfurisé.", "Placer au frigo 2h puis découper en barres."] },
  { id: 33, category: "Snacks", name: "Yaourt Grec & Myrtilles", prep: "2 min", ingredients: ["200g Yaourt grec authentique", "1 Poignée de myrtilles", "1 c.à.c Sirop d'agave"], instructions: ["Disposer le yaourt grec dans un bol.", "Laver les myrtilles et les déposer au-dessus.", "Verser le sirop d'agave en filet."] },
  { id: 34, category: "Snacks", name: "Galettes de Riz & Dinde", prep: "3 min", ingredients: ["3 Galettes de riz ou de maïs", "3 Tranches de blanc de dinde", "Fromage frais à tartiner type St-Moret allégé"], instructions: ["Tartiner finement les galettes de riz avec le fromage frais.", "Plier les tranches de dinde et les déposer sur les galettes.", "Ajouter un tour de moulin à poivre si souhaité."] },
  { id: 35, category: "Snacks", name: "Smoothie Bowl Açaï", prep: "5 min", ingredients: ["1 Purée d'Açaï surgelée (ou fruits rouges)", "1/2 Banane", "Granola", "Graines de courge"], instructions: ["Mixer la purée d'açaï avec très peu d'eau ou de lait pour garder une texture épaisse de glace.", "Verser dans un bol.", "Décorer avec la demi banane en rondelles, le granola et les graines."] },

  // --- DESSERTS SAINS (15) ---
  { id: 36, category: "Desserts", name: "Pancakes Protéinés", prep: "15 min", ingredients: ["2 Oeufs", "50g Flocons d'avoine mixés", "100g Fromage blanc 0%", "Levure"], instructions: ["Battre les oeufs avec le fromage blanc.", "Incorporer l'avoine et la levure.", "Cuire 2 min par face dans une poêle chaude et huilée."] },
  { id: 37, category: "Desserts", name: "Bowlcake Chocolat", prep: "5 min", ingredients: ["40g Flocons d'avoine", "1 Oeuf", "3 c.à.s Lait", "1 c.à.s Cacao amer", "1/2 c.à.c Levure"], instructions: ["Tout mélanger directement dans un bol (qui passe au micro-ondes).", "Cuire au micro-ondes à puissance max pendant 2 à 3 minutes.", "Démouler sur une assiette et laisser tiédir."] },
  { id: 38, category: "Desserts", name: "Mousse Choco-Avocat", prep: "10 min", ingredients: ["1 Avocat bien mûr", "2 c.à.s Cacao amer", "2 c.à.s Sirop d'agave ou Miel", "Un filet de Lait d'amande"], instructions: ["Couper l'avocat en deux et récupérer la chair.", "La placer dans un blender avec le cacao, le sirop et le lait.", "Mixer longuement jusqu'à obtenir une texture de mousse parfaitement lisse.", "Mettre au frais 1h avant dégustation."] },
  { id: 39, category: "Desserts", name: "Chia Pudding Mangue", prep: "5 min (repos 2h)", ingredients: ["3 c.à.s Graines de chia", "150ml Lait végétal", "1/2 Mangue fraîche", "1 c.à.c Miel"], instructions: ["Mélanger les graines de chia et le lait dans un verre.", "Remuer de nouveau après 5 minutes pour éviter les grumeaux.", "Laisser reposer au réfrigérateur pendant au moins 2 heures (idéalement toute la nuit).", "Ajouter des dés de mangue sur le dessus avant de manger."] },
  { id: 40, category: "Desserts", name: "Pomme Rôtie Cannelle", prep: "15 min", ingredients: ["1 Pomme", "Cannelle en poudre", "1 c.à.c Beurre doux", "1 c.à.c Sirop d'érable"], instructions: ["Évider le centre de la pomme (sans la percer de part en part).", "Insérer le beurre et le sirop d'érable au centre.", "Saupoudrer généreusement de cannelle.", "Cuire au four à 180°C pendant 15 minutes ou au micro-ondes pendant 4 minutes jusqu'à ce qu'elle soit fondante."] },
  { id: 41, category: "Desserts", name: "Brownie Haricots Rouges", prep: "30 min", ingredients: ["250g Haricots rouges rincés", "3 Oeufs", "40g Cacao amer", "50g Sirop d'érable", "1 c.à.c Levure"], instructions: ["Préchauffer le four à 180°C.", "Mettre tous les ingrédients dans un blender et mixer jusqu'à obtenir une pâte parfaitement lisse (sans morceaux).", "Verser dans un petit moule carré.", "Cuire environ 20 minutes."] },
  { id: 42, category: "Desserts", name: "Crumble Pomme Avoine", prep: "30 min", ingredients: ["2 Pommes", "50g Flocons d'avoine", "20g Huile de coco solide", "20g Sirop d'agave", "Cannelle"], instructions: ["Couper les pommes en dés et les placer au fond d'un petit plat à gratin.", "Sabler à la main l'avoine, l'huile de coco dure et le sirop d'agave.", "Émietter ce mélange sur les pommes.", "Enfourner 25 minutes à 180°C."] },
  { id: 43, category: "Desserts", name: "Glace Express Banane", prep: "5 min", ingredients: ["2 Bananes coupées en rondelles et congelées la veille", "1 c.à.s Lait d'amande", "Pépites de chocolat (option)"], instructions: ["Placer les rondelles de bananes congelées dans un robot mixeur puissant.", "Mixer en faisant des pauses pour racler les bords.", "Ajouter le lait d'amande pour aider au mixage.", "Une texture crémeuse de glace va se former, servir immédiatement."] },
  { id: 44, category: "Desserts", name: "Cookies Flocons d'Avoine", prep: "20 min", ingredients: ["2 Bananes bien mûres", "100g Flocons d'avoine", "Pépites de chocolat noir"], instructions: ["Écraser les bananes en purée à l'aide d'une fourchette.", "Incorporer les flocons d'avoine et bien mélanger.", "Ajouter les pépites de chocolat.", "Former des cookies sur une plaque de four et cuire 15 minutes à 180°C."] },
  { id: 45, category: "Desserts", name: "Tiramisu Allégé", prep: "15 min (repos 2h)", ingredients: ["2 Petits suisses 0%", "1 c.à.s Miel", "3 Boudoirs", "Café fort froid", "Cacao amer"], instructions: ["Mélanger les petits suisses avec le miel pour les détendre.", "Tremper très rapidement les boudoirs dans le café et les placer au fond d'une verrine.", "Recouvrir avec le mélange de petits suisses.", "Laisser au frais 2h et saupoudrer de cacao juste avant de servir."] },
  { id: 46, category: "Desserts", name: "Mugcake Vanille Protéiné", prep: "5 min", ingredients: ["30g Farine d'avoine", "1/2 dose Whey Vanille", "1 Oeuf", "3 c.à.s Lait", "1 pincée de Levure chimique"], instructions: ["Dans un grand mug, fouetter l'oeuf avec le lait.", "Ajouter la farine, la whey et la levure. Mélanger vigoureusement pour éviter les grumeaux.", "Cuire au micro-ondes pendant environ 1 minute à 1 minute 30.", "Manger directement dans le mug !"] },
  { id: 47, category: "Desserts", name: "Rochers Coco", prep: "20 min", ingredients: ["2 Blancs d'oeufs", "100g Noix de coco râpée", "40g Sucre de coco ou cassonade"], instructions: ["Mélanger la noix de coco avec le sucre.", "Monter très légèrement les blancs (ils doivent juste mousser) et les incorporer au mélange.", "Façonner des petits dômes à la main sur une plaque allant au four.", "Cuire environ 10-12 minutes à 180°C jusqu'à ce qu'ils soient dorés."] },
  { id: 48, category: "Desserts", name: "Panna Cotta Lait de Coco", prep: "10 min (repos 3h)", ingredients: ["200ml Lait de coco (brique)", "1g Agar-agar", "1 c.à.s Sirop d'agave", "Coulis de fruits rouges sans sucre"], instructions: ["Dans une petite casserole, mélanger le lait de coco, le sirop et l'agar-agar à froid.", "Porter à ébullition et laisser frémir 1 minute en remuant (essentiel pour activer l'agar-agar).", "Verser dans des verrines et laisser prendre au frigo 3 heures.", "Ajouter le coulis de fruits rouges avant de servir."] },
  { id: 49, category: "Desserts", name: "Clafoutis Cerises Allégé", prep: "40 min", ingredients: ["200g Cerises (fraîches ou surgelées)", "2 Oeufs", "250ml Lait d'amande", "30g Maïzena", "2 c.à.s Édulcorant ou miel"], instructions: ["Préchauffer le four à 180°C.", "Disposer les cerises au fond d'un moule en silicone.", "Fouetter les oeufs, la maïzena, le lait et le sucre.", "Verser l'appareil sur les cerises et enfourner 30 à 35 minutes."] },
  { id: 50, category: "Desserts", name: "Cheesecake Protéiné (sans cuisson)", prep: "15 min (repos 4h)", ingredients: ["4 Spéculoos émiettés", "200g Fromage blanc 0%", "1 c.à.s Citron pressé", "1 Feuille de gélatine", "Édulcorant"], instructions: ["Tasser les miettes de spéculoos au fond d'un emporte-pièce ou verrine.", "Ramollir la gélatine dans l'eau froide. Faire chauffer le jus de citron, y fondre la gélatine essorée.", "Mélanger le fromage blanc, l'édulcorant et le citron gélatiné.", "Verser sur les biscuits et laisser figer au frigo 4 heures minimum."] }
];


const RecipeBook = () => {
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [openRecipeId, setOpenRecipeId] = useState(null);

  const CATEGORIES = ["Toutes", "Smoothies & Shakes", "Plats", "Snacks", "Desserts"];

  const filteredRecipes = RECIPES.filter(recipe => 
    activeCategory === "Toutes" || recipe.category === activeCategory
  );

  return (
    <div className="p-4 max-w-[480px] mx-auto font-sans pb-24 text-left">
      <h2 className="text-2xl font-black text-[#1a1a2e] mb-4">Recettes</h2>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            onClick={() => { setActiveCategory(cat); setOpenRecipeId(null); }}
            className={`shrink-0 px-4 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <div 
              onClick={() => setOpenRecipeId(openRecipeId === recipe.id ? null : recipe.id)}
              className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${openRecipeId === recipe.id ? 'bg-indigo-50/50' : ''}`}
            >
              <div>
                <h3 className="text-sm font-bold text-[#1a1a2e] mb-1">{recipe.name}</h3>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-gray-400 tracking-tighter">⏱ {recipe.prep}</span>
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{recipe.category}</span>
                </div>
              </div>
              <motion.span animate={{ rotate: openRecipeId === recipe.id ? 180 : 0 }} className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs">
                ▼
              </motion.span>
            </div>

            <AnimatePresence>
              {openRecipeId === recipe.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-5 border-t border-gray-100 mt-1">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-4 mb-2">Ingrédients</h4>
                    <ul className="space-y-1.5 mb-5">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-emerald-400" /> {ing}
                        </li>
                      ))}
                    </ul>
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Préparation</h4>
                    <div className="space-y-3">
                      {recipe.instructions.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeBook;