import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { initiale, libelleQuand } from '../utils/format';
import { couleurs, degrade, espaces } from '../theme';

export default function LigneActivite({ reservation, onAccepter, onRefuser, onPress, occupe = false }) {
  const client = reservation.client;
  const element = reservation.produitService;
  const nom = client ? `${client.prenom} ${client.nom}` : 'Un client';
  return (
    <Pressable onPress={onPress} style={styles.ligne}>
      <View style={styles.gauche}>
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.lettre}>{initiale(nom)}</Text>
        </LinearGradient>
        <View style={styles.textes}>
          <Text style={styles.texte} numberOfLines={2}>
            <Text style={styles.gras}>{nom}</Text> demande{' '}
            <Text style={styles.gras}>{element ? element.nom : 'un élément'}</Text>
          </Text>
          <Text style={styles.quand}>{libelleQuand(reservation)}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onRefuser} disabled={occupe} style={[styles.pilule, styles.contour, occupe && styles.inactif]}>
          <Text style={[styles.pouleTexte, { color: couleurs.primaire }]}>Refuser</Text>
        </Pressable>
        <Pressable onPress={onAccepter} disabled={occupe} style={[styles.pilule, styles.plein, occupe && styles.inactif]}>
          {occupe ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={[styles.pouleTexte, { color: '#FFFFFF' }]}>Accepter</Text>}
        </Pressable>
      </View>
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
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
  gauche: { flexDirection: 'row', alignItems: 'center', flexGrow: 1, flexShrink: 1, flexBasis: 200, gap: espaces.s + 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  textes: { flex: 1 },
  texte: { fontSize: 14, color: couleurs.texte },
  gras: { fontWeight: '700' },
  quand: { fontSize: 12, color: couleurs.primaire, marginTop: 2 },
  actions: { flexDirection: 'row', gap: espaces.s },
  pilule: { minWidth: 84, height: 36, borderRadius: 18, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  contour: { backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.bordure },
  plein: { backgroundColor: couleurs.primaire },
  inactif: { opacity: 0.6 },
  pouleTexte: { fontSize: 13, fontWeight: '700' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});