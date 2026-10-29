import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espaces, rayon, ombre } from '../theme';
import { formatDateHeure } from '../utils/format';
import { visuelNotification } from '../utils/notificationsVisuel';

export default function CarteNotification({ notification, onPress }) {
  const nonLue = !notification.lue;
  const v = visuelNotification(notification.typeNotification);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.carte, nonLue && styles.nonLue, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.icone, { backgroundColor: v.fond }]}>
        <Ionicons name={v.icone} size={22} color={v.couleur} />
      </View>
      <View style={styles.textes}>
        <View style={styles.haut}>
          <Text style={[styles.titre, nonLue && styles.gras]} numberOfLines={1}>
            {String(notification.titre || 'Notification')}
          </Text>
          {nonLue ? <View style={styles.point} /> : null}
        </View>
        <Text style={styles.message} numberOfLines={2}>{String(notification.message || '')}</Text>
        {notification.dateEnvoi ? <Text style={styles.date}>{formatDateHeure(notification.dateEnvoi)}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={couleurs.texteSecondaire} />
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.s + 4,
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: espaces.m,
    marginBottom: espaces.s + 2,
    ...ombre,
  },
  nonLue: { borderLeftWidth: 4, borderLeftColor: couleurs.primaire },
  icone: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1 },
  haut: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titre: { flex: 1, fontSize: 15, color: couleurs.texte },
  gras: { fontWeight: '700' },
  point: { width: 9, height: 9, borderRadius: 5, backgroundColor: couleurs.primaire },
  message: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 3, lineHeight: 18 },
  date: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 6 },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});