import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, degrade, espaces } from '../theme';
import { initiale } from '../utils/format';

export default function LigneListe({ avatar, icone, titre, sousTitre, detail, droite, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.ligne}>
      <View style={styles.gauche}>
        {icone ? (
          <View style={styles.pastille}>
            <Ionicons name={icone} size={20} color={couleurs.primaire} />
          </View>
        ) : (
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.lettre}>{initiale(avatar || titre)}</Text>
          </LinearGradient>
        )}
        <View style={styles.textes}>
          <Text style={styles.titre} numberOfLines={1}>{titre}</Text>
          {sousTitre ? <Text style={styles.sousTitre} numberOfLines={1}>{sousTitre}</Text> : null}
          {detail ? <Text style={styles.detail} numberOfLines={2}>{detail}</Text> : null}
        </View>
      </View>
      {droite ? <View style={styles.droite}>{droite}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: {
    backgroundColor: couleurs.surface2,
    borderRadius: 16,
    padding: espaces.s + 4,
    marginBottom: espaces.s,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaces.s,
  },
  gauche: { flexDirection: 'row', alignItems: 'center', flexGrow: 1, flexShrink: 1, flexBasis: 220, gap: espaces.s + 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  pastille: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textes: { flex: 1 },
  titre: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  sousTitre: { fontSize: 13, color: couleurs.texte, marginTop: 1 },
  detail: { fontSize: 12, color: couleurs.primaire, marginTop: 2 },
  droite: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: espaces.s },
});