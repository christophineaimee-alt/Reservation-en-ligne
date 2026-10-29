import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import LigneInfo from '../../components/LigneInfo';
import { couleurs, espaces, rayon } from '../../theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LETTRES = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const CHIFFRES = '23456789';
const VIDE = { nom: '', prenom: '', email: '', telephone: '', motDePasse: '', confirmation: '' };

// Nombre aléatoire entre 0 et max - 1 (générateur sécurisé quand le navigateur en fournit un)
function hasard(max) {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (c && c.getRandomValues) {
    const t = new Uint32Array(1);
    c.getRandomValues(t);
    return t[0] % max;
  }
  return Math.floor(Math.random() * max);
}

// 12 caractères avec au moins une lettre et un chiffre, sans caractères ambigus (0, O, 1, l, I)
function genererMotDePasse() {
  const tous = LETTRES + CHIFFRES;
  const car = [LETTRES[hasard(LETTRES.length)], CHIFFRES[hasard(CHIFFRES.length)]];
  while (car.length < 12) car.push(tous[hasard(tous.length)]);
  for (let i = car.length - 1; i > 0; i -= 1) {
    const j = hasard(i + 1);
    [car[i], car[j]] = [car[j], car[i]];
  }
  return car.join('');
}

// UC22 : ajouter un administrateur
export default function AdministrateurFormEcran({ navigation }) {
  useThemeVersion();
  const { width } = useWindowDimensions();
  const [form, setForm] = useState(VIDE);
  const [afficher, setAfficher] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [cree, setCree] = useState(null);

  const changer = (champ) => (valeur) => setForm((f) => ({ ...f, [champ]: valeur }));
  const telephone = form.telephone.replace(/\s+/g, '');

  function generer() {
    const mdp = genererMotDePasse();
    setForm((f) => ({ ...f, motDePasse: mdp, confirmation: mdp }));
    setAfficher(true);
  }

  function valider() {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Le nom est obligatoire';
    if (!form.prenom.trim()) e.prenom = 'Le prénom est obligatoire';
    if (!EMAIL.test(form.email.trim())) e.email = 'E-mail invalide';
    if (telephone.length < 9 || telephone.length > 15) e.telephone = 'Téléphone invalide (9 à 15 chiffres)';
    if (form.motDePasse.length < 10 || !/[A-Za-z]/.test(form.motDePasse) || !/\d/.test(form.motDePasse)) {
      e.motDePasse = 'Au moins 10 caractères, avec une lettre et un chiffre';
    }
    if (form.confirmation !== form.motDePasse) e.confirmation = 'Les mots de passe ne correspondent pas';
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function creer() {
    setErreurServeur('');
    if (!valider()) return;
    const donnees = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim().toLowerCase(),
      telephone,
      motDePasse: form.motDePasse,
    };
    setEnvoi(true);
    try {
      await api.post('/admin/administrateurs', donnees);
      setCree(donnees);
      setForm(VIDE);
      setAfficher(false);
    } catch (e) {
      setErreurServeur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  const contenu = { maxWidth: width >= 900 ? 760 : 600 };

  // Écran de confirmation avec les identifiants à transmettre
  if (cree) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={[styles.contenu, contenu]}>
          <Bandeau type="succes" message="Administrateur créé. Il peut se connecter dès maintenant." />
          <Panneau titre="Identifiants à transmettre">
            <LigneInfo icone="person" titre="Nom" valeur={`${cree.prenom} ${cree.nom}`} />
            <LigneInfo icone="mail" titre="E-mail (identifiant)" valeur={cree.email} />
            <LigneInfo icone="call" titre="Téléphone" valeur={cree.telephone} />
            <LigneInfo icone="key" titre="Mot de passe" valeur={cree.motDePasse} />
          </Panneau>
          <Text style={styles.note}>
            Notez-le maintenant et transmettez-le en personne : le mot de passe n'est plus consultable ensuite.
          </Text>
          <View style={styles.boutons}>
            <Bouton titre="Ajouter un autre administrateur" onPress={() => setCree(null)} />
            <Bouton titre="Retour à la liste" variante="contour" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, contenu]} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Le nouvel administrateur pourra valider les boutiques, gérer les utilisateurs et les catégories.
        </Text>

        <Bandeau type="erreur" message={erreurServeur} />

        <Panneau titre="Nouvel administrateur">
          <ChampTexte label="Nom" value={form.nom} onChangeText={changer('nom')} erreur={erreurs.nom} autoCapitalize="words" />
          <ChampTexte label="Prénom" value={form.prenom} onChangeText={changer('prenom')} erreur={erreurs.prenom} autoCapitalize="words" />
          <ChampTexte label="E-mail" value={form.email} onChangeText={changer('email')} erreur={erreurs.email} keyboardType="email-address" placeholder="exemple@mail.com" />
          <ChampTexte label="Téléphone" value={form.telephone} onChangeText={changer('telephone')} erreur={erreurs.telephone} keyboardType="phone-pad" placeholder="034 12 345 67" />

          <ChampTexte
            label="Mot de passe"
            value={form.motDePasse}
            onChangeText={changer('motDePasse')}
            erreur={erreurs.motDePasse}
            secureTextEntry={!afficher}
            placeholder="10 caractères minimum"
          />
          <ChampTexte
            label="Confirmer le mot de passe"
            value={form.confirmation}
            onChangeText={changer('confirmation')}
            erreur={erreurs.confirmation}
            secureTextEntry={!afficher}
          />

          <View style={styles.outils}>
            <Pressable onPress={generer} style={styles.pilule}>
              <Text style={styles.piluleTexte}>Générer un mot de passe</Text>
            </Pressable>
            <Pressable onPress={() => setAfficher((a) => !a)} style={styles.pilule}>
              <Text style={styles.piluleTexte}>{afficher ? 'Masquer' : 'Afficher'}</Text>
            </Pressable>
          </View>

          <Bouton titre="Créer l'administrateur" onPress={creer} chargement={envoi} />
        </Panneau>
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  intro: { fontSize: 14, color: couleurs.texteSecondaire, marginBottom: espaces.m, lineHeight: 20 },
  note: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: espaces.m, lineHeight: 19 },
  boutons: { marginTop: espaces.m, gap: espaces.s },
  outils: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.s, marginBottom: espaces.m },
  pilule: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.primaireClair,
  },
  piluleTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});