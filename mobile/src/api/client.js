import axios from 'axios';
import { API_URL } from '../config';
import { lire, ecrire, effacer } from './stockage';

const CLE_JETON = 'jeton';

export const lireJeton = () => lire(CLE_JETON);
export const sauverJeton = (jeton) => ecrire(CLE_JETON, jeton);
export const effacerJeton = () => effacer(CLE_JETON);

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