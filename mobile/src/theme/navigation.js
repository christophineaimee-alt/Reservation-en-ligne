import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { couleurs, estSombre, ombre } from './index';
import { enregistrerStyles } from './registre';

function creerOptions() {
  return {
    headerShown: false,
    tabBarActiveTintColor: couleurs.primaire,
    tabBarInactiveTintColor: couleurs.texteSecondaire,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    tabBarStyle: {
      backgroundColor: couleurs.carte,
      borderTopWidth: 0,
      height: 64,
      paddingTop: 6,
      paddingBottom: 8,
      ...ombre,
      shadowOffset: { width: 0, height: -4 },
    },
  };
}

// Mis à jour sur place quand le mode change
export const optionsOnglets = creerOptions();
enregistrerStyles(() => {
  Object.assign(optionsOnglets, creerOptions());
});

// Couleurs des en-têtes et des fonds de React Navigation
export function themeNavigation() {
  const base = estSombre() ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: couleurs.primaire,
      background: couleurs.fond,
      card: couleurs.carte,
      text: couleurs.texte,
      border: couleurs.bordure,
      notification: couleurs.erreur,
    },
  };
}