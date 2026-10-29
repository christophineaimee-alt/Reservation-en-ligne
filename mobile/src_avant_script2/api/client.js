import axios from 'axios';
import { API_URL } from '../config';
import { lire, ecrire, effacer } from './stockage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CLE_JETON = 'jeton';

export async function lireJeton() {
  if (Platform.OS === 'web') return window.localStorage.getItem(CLE_JETON);
  return SecureStore.getItemAsync(CLE_JETON);
}

export async function sauverJeton(jeton) {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(CLE_JETON, jeton);
    return;
  }
  return SecureStore.setItemAsync(CLE_JETON, jeton);
}

export async function effacerJeton() {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(CLE_JETON);
    return;
  }
  return SecureStore.deleteItemAsync(CLE_JETON);
}

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// Ajoute le jeton à chaque requête
api.interceptors.request.use(async (config) => {
  const jeton = await lireJeton();
  if (jeton) config.headers.Authorization = `Bearer ${jeton}`;
  return config;
});

// Appelée quand le serveur refuse le jeton (expiré ou invalide)
let surNonAutorise = null;
export function definirSurNonAutorise(fonction) {
  surNonAutorise = fonction;
}

api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    const url = (erreur.config && erreur.config.url) || '';
    const refuse = erreur.response && erreur.response.status === 401;
    if (refuse && !url.includes('/auth/connexion') && surNonAutorise) surNonAutorise();
    return Promise.reject(erreur);
  }
);

// Message lisible à afficher à l'utilisateur
export function messageErreur(erreur) {
  if (erreur.response) {
    const donnees = erreur.response.data || {};
    if (Array.isArray(donnees.details) && donnees.details.length > 0) {
      return donnees.details.map((d) => d.message).join('\n');
    }
    return donnees.message || 'Une erreur est survenue';
  }
  if (erreur.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre';
  return "Connexion impossible. Vérifiez que l'API est démarrée.";
}

export default api;