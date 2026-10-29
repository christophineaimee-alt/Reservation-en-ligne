import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Ecran from '../../components/Ecran';
import Bouton from '../../components/Bouton';
import { couleurs, degradeHero, espaces } from '../../theme';

// Affiché à la place de la réservation tant que le visiteur n'est pas connecté
export default function ConnexionRequiseEcran({ navigation }) {
  return (
    <Ecran centre>
      <View style={styles.centre}>
        <LinearGradient colors={degradeHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cercle}>
          <Ionicons name="lock-closed" size={40} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.titre}>Connectez-vous pour réserver</Text>
        <Text style={styles.texte}>
          Créez un compte gratuit ou connectez-vous : vous pourrez réserver, payer avec votre mobile et suivre vos
          réservations.
        </Text>
      </View>
      <Bouton titre="Se connecter" onPress={() => navigation.navigate('Connexion')} />
      <Bouton titre="Créer un compte" variante="contour" onPress={() => navigation.navigate('Inscription')} style={{ marginTop: espaces.s + 4 }} />
      <Bouton titre="Continuer la visite" variante="texte" onPress={() => navigation.goBack()} style={{ marginTop: espaces.s }} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', marginBottom: espaces.l },
  cercle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: espaces.l },
  titre: { fontSize: 22, fontWeight: '800', color: couleurs.texte, textAlign: 'center' },
  texte: { fontSize: 14, color: couleurs.texteSecondaire, textAlign: 'center', marginTop: espaces.s + 4, lineHeight: 21 },
});