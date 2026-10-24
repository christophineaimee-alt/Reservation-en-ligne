import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, ombre } from '../theme';

const GRIS = '#7B8196';

export default function ChampRecherche({ valeur, onChangeText, placeholder = 'Rechercher', style }) {
  return (
    <View style={[styles.zone, style]}>
      <Ionicons name="search" size={18} color={GRIS} />
      <TextInput
        value={valeur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={GRIS}
        style={styles.champ}
        returnKeyType="search"
        autoCapitalize="none"
      />
      {valeur ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={GRIS} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    ...ombre,
  },
  champ: {
    flex: 1,
    fontSize: 15,
    color: couleurs.texte,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
});