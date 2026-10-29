import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { couleurs, espaces } from '../theme';

// Grille de créneaux : le client touche celui qu'il veut
export default function SelecteurCreneau({ creneaux, choisi, onChoisir }) {
  return (
    <View style={styles.grille}>
      {creneaux.map((c) => {
        const actif = c.idDisponibilite === choisi;
        return (
          <Pressable
            key={c.idDisponibilite}
            onPress={() => onChoisir(c.idDisponibilite)}
            style={[styles.creneau, actif && styles.actif]}
          >
            <Text style={[styles.heures, actif && styles.texteActif]}>
              {c.heureDebut} - {c.heureFin}
            </Text>
            <Text style={[styles.places, actif && styles.texteActif]}>
              {c.placesRestantes} place{c.placesRestantes > 1 ? 's' : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.s },
  creneau: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: couleurs.surface3,
    alignItems: 'center',
  },
  actif: { backgroundColor: couleurs.primaire },
  heures: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  places: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
  texteActif: { color: '#FFFFFF' },
});