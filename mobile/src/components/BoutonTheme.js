import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, estSombre, ombre } from '../theme';
import { basculerTheme } from '../theme/preference';
import { useThemeVersion } from '../theme/registre';

// Bouton lune / soleil : change le mode tout de suite, sans recharger
// surFond : sur un fond de couleur (bandeau, menu) ; petit : version 34 px
export default function BoutonTheme({ surFond = false, petit = false, style }) {
  useThemeVersion();
  const sombre = estSombre();
  const taille = petit ? 34 : 42;
  return (
    <Pressable
      onPress={basculerTheme}
      accessibilityLabel={sombre ? 'Passer en mode jour' : 'Passer en mode nuit'}
      style={({ pressed }) => [
        styles.bouton,
        { width: taille, height: taille, borderRadius: taille / 2 },
        surFond ? styles.surFond : styles.normal,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Ionicons
        name={sombre ? 'sunny-outline' : 'moon-outline'}
        size={petit ? 17 : 19}
        color={surFond ? '#FFFFFF' : couleurs.primaire}
      />
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
  bouton: { alignItems: 'center', justifyContent: 'center' },
  normal: { backgroundColor: couleurs.carte, ...ombre },
  surFond: { backgroundColor: 'rgba(255,255,255,0.16)' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});