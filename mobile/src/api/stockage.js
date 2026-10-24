import { Platform } from 'react-native';

// Téléphone : coffre sécurisé. Navigateur (aperçu VS Code) : localStorage.
const SecureStore = Platform.OS === 'web' ? null : require('expo-secure-store');

export async function lire(cle) {
  if (SecureStore) return SecureStore.getItemAsync(cle);
  return window.localStorage.getItem(cle);
}

export async function ecrire(cle, valeur) {
  if (SecureStore) return SecureStore.setItemAsync(cle, valeur);
  window.localStorage.setItem(cle, valeur);
}

export async function effacer(cle) {
  if (SecureStore) return SecureStore.deleteItemAsync(cle);
  window.localStorage.removeItem(cle);
}