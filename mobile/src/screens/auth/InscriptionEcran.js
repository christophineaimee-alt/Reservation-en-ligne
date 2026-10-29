import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Ecran from '../../components/Ecran';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import { useAuth } from '../../context/AuthContext';
import { messageErreur } from '../../api/client';
import { couleurs, espaces } from '../../theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UC01 : s'inscrire
export default function InscriptionEcran({ navigation }) {
  useThemeVersion();
  const { inscription } = useAuth();
  const [role, setRole] = useState('CLIENT');
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    motDePasse: '', confirmation: '', adresse: '', nomCommercial: '',
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [charge, setCharge] = useState(false);

  const changer = (champ) => (valeur) => setForm((f) => ({ ...f, [champ]: valeur }));
  const telephone = form.telephone.replace(/\s+/g, '');

  function valider() {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Le nom est obligatoire';
    if (!form.prenom.trim()) e.prenom = 'Le prénom est obligatoire';
    if (!EMAIL.test(form.email.trim())) e.email = 'E-mail invalide';
    if (telephone.length < 9 || telephone.length > 15) e.telephone = 'Téléphone invalide (9 à 15 chiffres)';
    if (form.motDePasse.length < 8) e.motDePasse = 'Au moins 8 caractères';
    if (form.confirmation !== form.motDePasse) e.confirmation = 'Les mots de passe ne correspondent pas';
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function sInscrire() {
    setErreurServeur('');
    if (!valider()) return;

    const donnees = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim().toLowerCase(),
      telephone,
      motDePasse: form.motDePasse,
      role,
    };
    if (role === 'CLIENT' && form.adresse.trim()) donnees.adresse = form.adresse.trim();
    if (role === 'COMMERCANT' && form.nomCommercial.trim()) donnees.nomCommercial = form.nomCommercial.trim();

    setCharge(true);
    try {
      await inscription(donnees);
      navigation.navigate('Connexion', { message: 'Compte créé. Vous pouvez maintenant vous connecter.' });
    } catch (e) {
      setErreurServeur(messageErreur(e));
      setCharge(false);
    }
  }

  return (
    <Ecran centre={false}>
      <Text style={styles.titre}>Créer un compte</Text>
      <Text style={styles.sousTitre}>Choisissez votre profil puis remplissez vos informations.</Text>

      <View style={styles.roles}>
        <ChoixRole titre="Client" icone="person" actif={role === 'CLIENT'} onPress={() => setRole('CLIENT')} />
        <ChoixRole titre="Commerçant" icone="storefront" actif={role === 'COMMERCANT'} onPress={() => setRole('COMMERCANT')} />
      </View>

      <Bandeau type="erreur" message={erreurServeur} />

      <Panneau>
        <ChampTexte label="Nom" value={form.nom} onChangeText={changer('nom')} erreur={erreurs.nom} autoCapitalize="words" />
        <ChampTexte label="Prénom" value={form.prenom} onChangeText={changer('prenom')} erreur={erreurs.prenom} autoCapitalize="words" />
        <ChampTexte label="E-mail" value={form.email} onChangeText={changer('email')} erreur={erreurs.email} keyboardType="email-address" placeholder="exemple@mail.com" />
        <ChampTexte label="Téléphone" value={form.telephone} onChangeText={changer('telephone')} erreur={erreurs.telephone} keyboardType="phone-pad" placeholder="034 12 345 67" />

        {role === 'CLIENT' ? (
          <ChampTexte label="Adresse (facultatif)" value={form.adresse} onChangeText={changer('adresse')} autoCapitalize="sentences" />
        ) : (
          <ChampTexte label="Nom commercial (facultatif)" value={form.nomCommercial} onChangeText={changer('nomCommercial')} autoCapitalize="words" />
        )}

        <ChampTexte label="Mot de passe" value={form.motDePasse} onChangeText={changer('motDePasse')} erreur={erreurs.motDePasse} secureTextEntry placeholder="8 caractères minimum" />
        <ChampTexte label="Confirmer le mot de passe" value={form.confirmation} onChangeText={changer('confirmation')} erreur={erreurs.confirmation} secureTextEntry />

        <Bouton titre="Créer mon compte" onPress={sInscrire} chargement={charge} />
      </Panneau>
    </Ecran>
  );
}

function ChoixRole({ titre, icone, actif, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.choix, actif && styles.choixActif]}>
      <Ionicons name={icone} size={24} color={actif ? couleurs.primaire : couleurs.texteSecondaire} />
      <Text style={[styles.choixTexte, actif && styles.choixTexteActif]}>{titre}</Text>
    </Pressable>
  );
}

const creerStyles = () => StyleSheet.create({
  titre: { fontSize: 26, fontWeight: '700', color: couleurs.texte },
  sousTitre: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: espaces.xs, marginBottom: espaces.m },
  roles: { flexDirection: 'row', gap: espaces.s, marginBottom: espaces.m },
  choix: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: couleurs.carte,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choixActif: { borderColor: couleurs.primaire, backgroundColor: couleurs.primaireClair },
  choixTexte: { fontSize: 15, fontWeight: '600', color: couleurs.texteSecondaire },
  choixTexteActif: { color: couleurs.primaire, fontWeight: '700' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});