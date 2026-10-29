import { useSyncExternalStore } from 'react';

const rafraichisseurs = []; // fonctions qui recréent les styles de chaque fichier
const abonnes = new Set();
let version = 0;

export function enregistrerStyles(fonction) {
  rafraichisseurs.push(fonction);
}

// Recrée tous les styles, puis prévient les écrans de se redessiner
export function rafraichirTout() {
  rafraichisseurs.forEach((f) => {
    try {
      f();
    } catch (e) {
      // un fichier en échec n'empêche pas les autres de se mettre à jour
    }
  });
  version += 1;
  abonnes.forEach((a) => a());
}

function abonner(rappel) {
  abonnes.add(rappel);
  return () => abonnes.delete(rappel);
}

function lireVersion() {
  return version;
}

// À appeler dans un écran : il se redessine quand le mode jour ou nuit change
export function useThemeVersion() {
  return useSyncExternalStore(abonner, lireVersion);
}