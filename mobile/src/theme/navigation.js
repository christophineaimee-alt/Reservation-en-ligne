import { couleurs, ombre } from './index';

// Barre d'onglets du bas
export const optionsOnglets = {
  headerShown: false,
  tabBarActiveTintColor: couleurs.primaire,
  tabBarInactiveTintColor: couleurs.texteSecondaire,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
    ...ombre,
    shadowOffset: { width: 0, height: -4 },
  },
};

// En-tête des écrans de détail : fond lavande, sans trait, titre sombre
export const optionsPile = {
  headerTintColor: couleurs.primaire,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: couleurs.fond },
  headerTitleStyle: { color: couleurs.texte, fontWeight: '600', fontSize: 17 },
  contentStyle: { backgroundColor: couleurs.fond },
};