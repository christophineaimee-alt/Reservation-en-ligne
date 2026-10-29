import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COULEUR_ETOILE } from './Etoiles';

export default function SelecteurEtoiles({ valeur, onChange, taille = 42 }) {
  return (
    <View style={styles.ligne}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)} hitSlop={6}>
          <Ionicons name={valeur >= i ? 'star' : 'star-outline'} size={taille} color={COULEUR_ETOILE} />
        </Pressable>
      ))}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  ligne: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});