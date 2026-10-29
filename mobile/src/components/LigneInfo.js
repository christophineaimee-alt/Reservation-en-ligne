import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espaces } from '../theme';

export default function LigneInfo({ icone, titre, valeur, rouge }) {
  return (
    <View style={styles.ligne}>
      <View style={styles.pastille}>
        <Ionicons name={icone} size={17} color={couleurs.primaire} />
      </View>
      <View style={styles.textes}>
        <Text style={styles.titre}>{titre}</Text>
        <Text style={[styles.valeur, rouge && { color: couleurs.erreur }]}>{valeur}</Text>
      </View>
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: espaces.s },
  pastille: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: espaces.m,
  },
  textes: { flex: 1 },
  titre: { fontSize: 12, color: couleurs.texteSecondaire },
  valeur: { fontSize: 15, fontWeight: '600', color: couleurs.texte, marginTop: 1 },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});