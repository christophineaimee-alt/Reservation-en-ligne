import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { infoStatut } from '../utils/statuts';

export default function BadgeStatut({ statut }) {
  const info = infoStatut(statut);
  return (
    <Text style={[styles.badge, { color: info.couleur, backgroundColor: info.fond }]}>{info.libelle}</Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});