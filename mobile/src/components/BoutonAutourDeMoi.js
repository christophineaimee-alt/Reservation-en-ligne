import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BoutonAutourDeMoi({ style }) {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => navigation.navigate('AutourDeMoi')} style={[styles.bouton, style]}>
      <Ionicons name="location" size={18} color="#FFFFFF" />
      <Text style={styles.texte}>Autour de moi</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#5F55B8',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  texte: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});