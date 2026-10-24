import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function Badge({ info }) {
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