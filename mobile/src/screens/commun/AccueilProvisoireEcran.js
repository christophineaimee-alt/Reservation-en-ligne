import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import { useAuth } from '../../context/AuthContext';
import { couleurs, espaces } from '../../theme';

const LIBELLES = { CLIENT: 'Client', COMMERCANT: 'Commerçant', ADMIN: 'Administrateur' };

// Écran temporaire : confirme que la connexion fonctionne
export default function AccueilProvisoireEcran() {
  const { utilisateur, deconnexion } = useAuth();
  return (
    <Ecran>
      <Text style={styles.titre}>Bonjour {utilisateur.prenom} {utilisateur.nom}</Text>
      <Text style={styles.texte}>Rôle : {LIBELLES[utilisateur.role] || utilisateur.role}</Text>
      <Text style={styles.texte}>{utilisateur.email}</Text>
      <Text style={styles.info}>Connexion réussie. Les écrans de l'application arrivent aux étapes suivantes.</Text>
      <Bouton titre="Se déconnecter" variante="contour" onPress={deconnexion} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  titre: { fontSize: 24, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.s },
  texte: { fontSize: 16, color: couleurs.texte, marginBottom: espaces.xs },
  info: { color: couleurs.texteSecondaire, marginVertical: espaces.l },
});