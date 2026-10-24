import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ecran from '../../components/Ecran';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { messageErreur } from '../../api/client';
import { couleurs, espaces } from '../../theme';

// UC02 : s'authentifier
export default function ConnexionEcran({ navigation, route }) {
  const { connexion } = useAuth();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [charge, setCharge] = useState(false);

  async function seConnecter() {
    if (!identifiant.trim() || !motDePasse) {
      setErreur('Saisissez votre identifiant et votre mot de passe');
      return;
    }
    setErreur('');
    setCharge(true);
    // Un numéro de téléphone est enregistré sans espaces
    const id = identifiant.includes('@') ? identifiant.trim() : identifiant.replace(/\s+/g, '');
    try {
      await connexion(id, motDePasse);
    } catch (e) {
      setErreur(messageErreur(e));
      setCharge(false);
    }
  }

  return (
    <Ecran>
      <View style={styles.entete}>
        <Logo />
        <Text style={styles.titre}>Bon retour parmi nous</Text>
        <Text style={styles.sousTitre}>Réservez auprès des commerces près de chez vous</Text>
      </View>

      <Bandeau type="succes" message={route.params && route.params.message} />
      <Bandeau type="erreur" message={erreur} />

      <Panneau>
        <ChampTexte
          label="E-mail ou téléphone"
          value={identifiant}
          onChangeText={setIdentifiant}
          placeholder="exemple@mail.com ou 0341234567"
          keyboardType="email-address"
        />
        <ChampTexte
          label="Mot de passe"
          value={motDePasse}
          onChangeText={setMotDePasse}
          placeholder="Votre mot de passe"
          secureTextEntry
          onSubmitEditing={seConnecter}
        />
        <Bouton titre="Se connecter" onPress={seConnecter} chargement={charge} />
      </Panneau>

      <Bouton
        titre="Pas encore de compte ? S'inscrire"
        variante="texte"
        onPress={() => navigation.navigate('Inscription')}
        style={{ marginTop: espaces.m }}
      />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  entete: { alignItems: 'center', marginBottom: espaces.l },
  titre: { fontSize: 26, fontWeight: '700', color: couleurs.texte, marginTop: espaces.l, textAlign: 'center' },
  sousTitre: { fontSize: 15, color: couleurs.texteSecondaire, marginTop: espaces.xs, textAlign: 'center' },
});