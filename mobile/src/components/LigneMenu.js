import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces, rayon } from '../theme';

export default function LigneMenu({ titre, description, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ligne, pressed && styles.appuye]}>
      <View style={styles.textes}>
        <Text style={styles.titre}>{titre}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Text style={styles.fleche}>›</Text>
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
    marginBottom: espaces.s,
  },
  appuye: { opacity: 0.85 },
  textes: { flex: 1 },
  titre: { fontSize: 16, fontWeight: '600', color: couleurs.texte },
  description: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },
  fleche: { fontSize: 24, color: couleurs.texteSecondaire, marginLeft: espaces.s },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});