import { definirApplicateur, estSombre } from './preference';
import { rafraichirTout } from './registre';

export { estSombre };

const claire = {
  primaire: '#5F55B8',
  primaireClair: '#ECEAF8',
  primaireSombre: '#4D4398',
  texte: '#1E1B3F',
  texteSecondaire: '#8A8DA6',
  fond: '#F4F5FB',
  carte: '#FFFFFF',
  bordure: '#ECEDF6',
  bordureForte: '#D9D6EE',
  surface2: '#F7F7FC',
  surface3: '#F1F2FA',
  neutreFond: '#EEF0F5',
  contraste: '#1E1B3F',
  accent: '#F0763A',
  accentFond: '#FDEBE2',
  turquoise: '#2BA9B0',
  turquoiseFond: '#DDF4F5',
  erreur: '#F2385A',
  erreurFond: '#FDE8EC',
  succes: '#1FA85A',
  succesFond: '#E3F8EC',
  attention: '#D4651F',
  attentionFond: '#FDEBE2',
  avertFond: '#FFF4DB',
  menuFond: '#5F55B8',
  menuPastille: '#FFFFFF',
  menuPastilleTexte: '#5F55B8',
};

const nuit = {
  primaire: '#8F86F2',
  primaireClair: '#26254F',
  primaireSombre: '#6C61C9',
  texte: '#ECEBFA',
  texteSecondaire: '#9396B5',
  fond: '#0E1124',
  carte: '#171A33',
  bordure: '#262A4A',
  bordureForte: '#3A3F6B',
  surface2: '#1E2242',
  surface3: '#242950',
  neutreFond: '#262A48',
  contraste: '#2B2F5C',
  accent: '#FF9358',
  accentFond: '#3A2A24',
  turquoise: '#34C3CB',
  turquoiseFond: '#143A43',
  erreur: '#FF6B86',
  erreurFond: '#3B1E2C',
  succes: '#3DD68C',
  succesFond: '#12372B',
  attention: '#FFA24D',
  attentionFond: '#3A2D1D',
  avertFond: '#3A2F1C',
  menuFond: '#151832',
  menuPastille: '#2E3270',
  menuPastilleTexte: '#FFFFFF',
};

const DEGRADE = { jour: ['#6C61C9', '#5348A8'], nuit: ['#7468D6', '#5F55B8'] };
const DEGRADE_HERO = { jour: ['#4D4398', '#5F55B8', '#7468D6'], nuit: ['#1D1A4A', '#2B2670', '#3A4BB8'] };
const OMBRE = {
  jour: { shadowColor: '#2A2370', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  nuit: { shadowColor: '#000000', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
};

// Ces objets sont « vivants » : leur contenu est remplacé sur place quand le mode change,
// donc tous les fichiers qui les ont importés voient les nouvelles valeurs.
export const couleurs = { ...claire };
export const degrade = [...DEGRADE.jour];
export const degradeHero = [...DEGRADE_HERO.jour];
export const ombre = { ...OMBRE.jour };

export const espaces = { xs: 4, s: 8, m: 16, l: 24, xl: 32 };
export const rayon = 22;

function appliquerMode(sombre) {
  const cle = sombre ? 'nuit' : 'jour';
  Object.assign(couleurs, sombre ? nuit : claire);
  degrade.splice(0, degrade.length, ...DEGRADE[cle]);
  degradeHero.splice(0, degradeHero.length, ...DEGRADE_HERO[cle]);
  Object.assign(ombre, OMBRE[cle]);
}

// Mode de départ, puis changements en direct
appliquerMode(estSombre());
definirApplicateur((sombre) => {
  appliquerMode(sombre);
  rafraichirTout();
});