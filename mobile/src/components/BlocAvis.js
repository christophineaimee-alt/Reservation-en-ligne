import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Bouton from './Bouton';
import Etoiles from './Etoiles';
import { couleurs, espaces, rayon, ombre } from '../theme';

// Visible seulement pour une réservation acceptée dont le rendez-vous est passé
export default function BlocAvis({ reservation, onDonner, onModifier }) {
  const passe = new Date(reservation.dateHeure) < new Date();
  if (reservation.statut !== 'ACCEPTEE' || !passe) return null;
  const avis = reservation.avis;

  if (!avis) {
    return (
      <View style={[styles.carte, styles.invite]}>
        <Text style={styles.titre}>Comment s'est passé votre rendez-vous ?</Text>
        <Text style={styles.texte}>Votre avis aide la boutique et les autres clients.</Text>
        <Bouton titre="Donner mon avis" onPress={onDonner} style={styles.bouton} />
      </View>
    );
  }
  return (
    <View style={styles.carte}>
      <Text style={styles.titre}>Votre avis</Text>
      <Etoiles note={avis.note} taille={20} style={{ marginTop: 6 }} />
      {avis.commentaire ? <Text style={styles.texte}>{avis.commentaire}</Text> : null}
      {avis.reponse ? (
        <View style={styles.reponse}>
          <Text style={styles.reponseTitre}>Réponse de la boutique</Text>
          <Text style={styles.reponseTexte}>{avis.reponse}</Text>
        </View>
      ) : null}
      <Bouton titre="Modifier mon avis" variante="contour" onPress={onModifier} style={styles.bouton} />
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, marginVertical: espaces.s, ...ombre },
  invite: { backgroundColor: couleurs.primaireClair },
  titre: { fontSize: 16, fontWeight: '700', color: couleurs.texte },
  texte: { fontSize: 14, color: couleurs.texte, marginTop: espaces.s },
  reponse: { backgroundColor: couleurs.primaireClair, borderRadius: 12, padding: espaces.s + 4, marginTop: espaces.s + 2 },
  reponseTitre: { fontSize: 12, fontWeight: '700', color: couleurs.primaire },
  reponseTexte: { fontSize: 13, color: couleurs.texte, marginTop: 2 },
  bouton: { marginTop: espaces.m },
});