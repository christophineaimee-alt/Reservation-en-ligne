import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BadgeStatut from './BadgeStatut';
import Pilule from './Pilule';
import { formatPrix, initiale, libelleQuand } from '../utils/format';
import { couleurs, degrade, espaces } from '../theme';

// mode 'client'     : « Coupe femme chez Salon Marie »
// mode 'commercant' : « Jean Rakoto demande Coupe femme »
export default function LigneReservation({
  reservation,
  mode = 'client',
  onPress,
  onAccepter,
  onRefuser,
  onAnnuler,
  occupe = false,
}) {
  const element = reservation.produitService;
  const produit = element && element.type === 'PRODUIT';
  const client = reservation.client;
  const boutique = element && element.boutique ? element.boutique.nom : '';
  const nomClient = client ? `${client.prenom} ${client.nom}` : 'Un client';
  const nomElement = element ? element.nom : 'un élément';
  const total = element ? element.prix * reservation.quantite : 0;
  const quantite = produit && reservation.quantite > 1 ? ` × ${reservation.quantite}` : '';
  const quand = `${produit ? 'Retrait : ' : ''}${libelleQuand(reservation)} · ${formatPrix(total)}`;
  const commercant = mode === 'commercant';
  const decision = commercant && reservation.statut === 'EN_ATTENTE';
  const annulable = commercant && reservation.statut === 'ACCEPTEE' && Boolean(onAnnuler);
  const pourAvatar = commercant ? nomClient : boutique || nomElement;

  return (
    <Pressable onPress={onPress} style={styles.ligne}>
      <View style={styles.gauche}>
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.lettre}>{initiale(pourAvatar)}</Text>
        </LinearGradient>
        <View style={styles.textes}>
          {commercant ? (
            <Text style={styles.texte} numberOfLines={2}>
              <Text style={styles.gras}>{nomClient}</Text> demande <Text style={styles.gras}>{nomElement}</Text>
              {quantite}
            </Text>
          ) : (
            <Text style={styles.texte} numberOfLines={2}>
              <Text style={styles.gras}>{nomElement}</Text>
              {quantite}
              {boutique ? ' chez ' : ''}
              {boutique ? <Text style={styles.gras}>{boutique}</Text> : null}
            </Text>
          )}
          <Text style={styles.quand} numberOfLines={2}>{quand}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {decision ? (
          <>
            <Pilule titre="Refuser" variante="danger" onPress={onRefuser} desactive={occupe} />
            <Pilule titre="Accepter" variante="plein" onPress={onAccepter} occupe={occupe} />
          </>
        ) : (
          <>
            <BadgeStatut statut={reservation.statut} />
            {annulable ? <Pilule titre="Annuler" variante="danger" onPress={onAnnuler} /> : null}
            <Pilule titre="Détail" onPress={onPress} />
          </>
        )}
      </View>
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
  textes: { flex: 1 },
  texte: { fontSize: 14, color: couleurs.texte },
  gras: { fontWeight: '700' },
  quand: { fontSize: 12, color: couleurs.primaire, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: espaces.s },
});