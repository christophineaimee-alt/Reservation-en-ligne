import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Etoiles from './Etoiles';
import { couleurs, espaces } from '../theme';

export default function LigneNote({ noteMoyenne, nombreAvis, onPress }) {
  return (
    <Pressable onPress={nombreAvis > 0 ? onPress : undefined} style={styles.ligne}>
      <Etoiles note={noteMoyenne} nombre={nombreAvis} taille={16} />
      <View style={{ flex: 1 }} />
      {nombreAvis > 0 ? (
        <>
          <Text style={styles.lien}>Voir les avis</Text>
          <Ionicons name="chevron-forward" size={16} color={couleurs.primaire} />
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: espaces.s },
  lien: { fontSize: 13, fontWeight: '600', color: couleurs.primaire },
});