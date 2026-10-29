import { enregistrerStyles } from '../theme/registre';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BadgeStatut from './BadgeStatut';
import { couleurs, espaces, rayon } from '../theme';
import { formatPrix, libelleQuand } from '../utils/format';
import BadgePaiement from './BadgePaiement';

export default function CarteReservation({ reservation, onPress }) {
  const element = reservation.produitService;
  const produit = element && element.type === 'PRODUIT';
  const total = element ? element.prix * reservation.quantite : 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.carte, pressed && styles.appuye]}>
      <View style={styles.haut}>
        <Text style={styles.nom} numberOfLines={1}>{element ? element.nom : 'Élément supprimé'}</Text>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <BadgeStatut statut={reservation.statut} />
          <BadgePaiement reservation={reservation} />
        </View>
      </View>
      {element && element.boutique ? <Text style={styles.boutique}>{element.boutique.nom}</Text> : null}
      <Text style={styles.quand}>
        {produit ? 'Retrait : ' : ''}
        {libelleQuand(reservation)}
      </Text>
      <View style={styles.bas}>
        <Text style={styles.detail}>{produit ? `Quantité : ${reservation.quantite}` : 'Service'}</Text>
        <Text style={styles.total}>{formatPrix(total)}</Text>
      </View>
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
    marginBottom: espaces.s,
  },
  appuye: { opacity: 0.85 },
  haut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nom: { flex: 1, fontSize: 16, fontWeight: '700', color: couleurs.texte, marginRight: espaces.s },
  boutique: { fontSize: 13, color: couleurs.primaire, fontWeight: '600', marginTop: 2 },
  quand: { fontSize: 14, color: couleurs.texte, marginTop: espaces.s },
  bas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: espaces.s },
  detail: { fontSize: 14, color: couleurs.texteSecondaire },
  total: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});