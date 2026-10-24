import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BadgeStatut from './BadgeStatut';
import { couleurs, espaces, rayon } from '../theme';
import { formatPrix, libelleQuand } from '../utils/format';
import BadgePaiement from './BadgePaiement';

// Une demande de réservation vue par le commerçant (avec le nom du client)
export default function CarteReservationCommercant({ reservation, onPress }) {
  const element = reservation.produitService;
  const produit = element && element.type === 'PRODUIT';
  const total = element ? element.prix * reservation.quantite : 0;
  const client = reservation.client;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.carte, pressed && styles.appuye]}>
      <View style={styles.haut}>
        <Text style={styles.client} numberOfLines={1}>
          {client ? `${client.prenom} ${client.nom}` : 'Client'}
        </Text>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <BadgeStatut statut={reservation.statut} />
          <BadgePaiement reservation={reservation} />
        </View>
      </View>
      <Text style={styles.nom} numberOfLines={1}>{element ? element.nom : 'Élément supprimé'}</Text>
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

const styles = StyleSheet.create({
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
  client: { flex: 1, fontSize: 16, fontWeight: '700', color: couleurs.texte, marginRight: espaces.s },
  nom: { fontSize: 14, color: couleurs.primaire, fontWeight: '600', marginTop: 2 },
  quand: { fontSize: 14, color: couleurs.texte, marginTop: espaces.s },
  bas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: espaces.s },
  detail: { fontSize: 14, color: couleurs.texteSecondaire },
  total: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
});