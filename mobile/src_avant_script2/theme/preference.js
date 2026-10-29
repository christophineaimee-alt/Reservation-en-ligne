import { Appearance, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CLE = 'theme_mode';
let sombre = false;
let applicateur = null;

async function lire() {
  try {
    if (Platform.OS === 'web') return window.localStorage.getItem(CLE);
    return await SecureStore.getItemAsync(CLE);
  } catch (e) {
    return null;
  }
}

async function ecrire(valeur) {
  try {
    if (Platform.OS === 'web') window.localStorage.setItem(CLE, valeur);
    else await SecureStore.setItemAsync(CLE, valeur);
  } catch (e) {
    // préférence non enregistrée : le thème reviendra au réglage de l'appareil
  }
}

// Appelé avant le chargement du reste de l'application
export async function chargerPreferenceTheme() {
  const stocke = await lire();
  if (stocke === 'sombre') sombre = true;
  else if (stocke === 'clair') sombre = false;
  else sombre = Appearance.getColorScheme() === 'dark'; // première fois : réglage de l'appareil
}

export function estSombre() {
  return sombre;
}

// Le thème indique ici comment appliquer un changement de mode
export function definirApplicateur(fonction) {
  applicateur = fonction;
}

// Passe du jour à la nuit (et inversement), sans recharger l'application
export function basculerTheme() {
  sombre = !sombre;
  ecrire(sombre ? 'sombre' : 'clair');
  if (applicateur) applicateur(sombre);
}