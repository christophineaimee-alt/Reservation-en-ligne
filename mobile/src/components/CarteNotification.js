import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espaces } from '../theme';
import { formatDateHeure } from '../utils/format';

const ATTENTION_FOND = '#FFF4DB';

// Icône et couleurs selon le type de notification
function apparence(type) {
  const t = String(type || '');
  if (/ACCEPT|VALID|REACTIV/.test(t)) return { icone: 'checkmark-circle', couleur: couleurs.succes, fond: couleurs.succesFond };
  if (/REFUS|REJET/.test(t)) return { icone: 'close-circle', couleur: couleurs.erreur, fond: couleurs.erreurFond };
  if (/ANNUL/.test(t)) return { icone: 'close-circle-outline', couleur: couleurs.erreur, fond: couleurs.erreurFond };
  if (/EXPIR/.test(t)) return { icone: 'time', couleur: couleurs.attention, fond: ATTENTION_FOND };
  if (/STOCK/.test(t)) return { icone: 'cube', couleur: couleurs.attention, fond: ATTENTION_FOND };
  if (/SUSPEND/.test(t)) return { icone: 'lock-closed', couleur: couleurs.erreur, fond: couleurs.erreurFond };
  if (/DEMANDE/.test(t)) return { icone: 'calendar', couleur: couleurs.primaire, fond: couleurs.primaireClair };
  if (/BOUTIQUE/.test(t)) return { icone: 'storefront', couleur: couleurs.primaire, fond: couleurs.primaireClair };
  return { icone: 'notifications', couleur: couleurs.primaire, fond: couleurs.primaireClair };
}

export default function CarteNotification({ notification, onPress }) {
  const nonLue = !notification.lue;
  const style = apparence(notification.typeNotification);

  return (
    <Pressable onPress={onPress} style={[styles.ligne, nonLue && styles.nonLue]}>
      <View style={styles.gauche}>
        <View style={[styles.icone, { backgroundColor: style.fond }]}>
          <Ionicons name={style.icone} size={20} color={style.couleur} />
        </View>
        <View style={styles.textes}>
          <Text style={[styles.titre, nonLue && styles.gras]} numberOfLines={2}>{notification.titre}</Text>
          <Text style={styles.message}>{notification.message}</Text>
          <Text style={styles.date}>{formatDateHeure(notification.dateEnvoi)}</Text>
        </View>
      </View>
      {nonLue ? (
        <Pressable onPress={onPress} style={styles.pilule}>
          <Text style={styles.pouleTexte}>Marquer lu</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: {
    backgroundColor: '#F7F7FC',
    borderRadius: 16,
    padding: espaces.s + 4,
    marginBottom: espaces.s,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaces.s,
  },
  nonLue: { backgroundColor: couleurs.primaireClair },
  gauche: { flexDirection: 'row', alignItems: 'center', flexGrow: 1, flexShrink: 1, flexBasis: 220, gap: espaces.s + 4 },
  icone: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1 },
  titre: { fontSize: 14, color: couleurs.texte },
  gras: { fontWeight: '700' },
  message: { fontSize: 13, color: couleurs.texte, marginTop: 2 },
  date: { fontSize: 12, color: couleurs.primaire, marginTop: 3 },
  pilule: {
    minWidth: 84,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  pouleTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
});