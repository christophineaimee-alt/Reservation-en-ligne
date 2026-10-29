import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import Badge from '../../components/Badge';
import LigneInfo from '../../components/LigneInfo';
import Puce from '../../components/Puce';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { JOURS, ORDRE_JOURS, formatDateHeure, initiale } from '../../utils/format';
import { infoStatutBoutique } from '../../utils/statuts';

const REJETS_RAPIDES = ['Informations incomplètes', 'Logo ou photo manquant', 'Adresse introuvable', 'Catégorie inadaptée'];

// UC23 : examiner une boutique, la valider ou la rejeter
export default function BoutiqueAdminDetailEcran({ route }) {
  useThemeVersion();
  const { idBoutique } = route.params;
  const action = route.params ? route.params.action : null;
  const { width } = useWindowDimensions();

  const [boutique, setBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [etape, setEtape] = useState(null); // null, 'valider' ou 'rejeter'
  const [actionAppliquee, setActionAppliquee] = useState(false);
  const [motif, setMotif] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/boutiques/${idBoutique}`);
      setBoutique(data.boutique);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, [idBoutique]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Venu du bouton « Rejeter » de la liste : on ouvre directement le formulaire
  useEffect(() => {
    if (!boutique || actionAppliquee) return;
    setActionAppliquee(true);
    if (action === 'rejeter' && boutique.statut === 'EN_ATTENTE') setEtape('rejeter');
  }, [boutique, action, actionAppliquee]);

  async function decider(decision) {
    setErreur('');
    setSucces('');
    if (decision === 'REJETER' && !motif.trim()) {
      setErreur('Le motif de rejet est obligatoire');
      return;
    }
    const corps = { decision };
    if (decision === 'REJETER') corps.motif = motif.trim();

    setEnvoi(true);
    try {
      const { data } = await api.patch(`/admin/boutiques/${idBoutique}/validation`, corps);
      setSucces(data.message);
      setEtape(null);
      setMotif('');
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
      setEtape(null);
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return <Chargement />;

  if (!boutique) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <View style={{ padding: espaces.m }}>
          <Bandeau type="erreur" message={erreur || 'Boutique introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  const aLogo = boutique.logo && String(boutique.logo).startsWith('http');
  const gerant = boutique.commercant;
  const enAttente = boutique.statut === 'EN_ATTENTE';

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}>
        <Bandeau type="succes" message={succes} />
        <Bandeau type="erreur" message={erreur} />

        <View style={styles.heroZone}>
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroHaut}>
              {aLogo ? (
                <Image source={{ uri: boutique.logo }} style={styles.logo} />
              ) : (
                <View style={[styles.logo, styles.logoInitiale]}>
                  <Text style={styles.lettre}>{initiale(boutique.nom)}</Text>
                </View>
              )}
              <Badge info={infoStatutBoutique(boutique.statut)} />
            </View>
            <Text style={styles.heroNom}>{boutique.nom}</Text>
            {boutique.categorie ? <Text style={styles.heroCategorie}>{boutique.categorie.nom}</Text> : null}
            {boutique.description ? <Text style={styles.heroDescription}>{boutique.description}</Text> : null}
          </LinearGradient>
        </View>

        {enAttente && !etape ? (
          <Panneau titre="Votre décision" style={styles.espace}>
            <View style={styles.deuxBoutons}>
              <Bouton titre="Rejeter" variante="danger" onPress={() => setEtape('rejeter')} style={styles.moitie} />
              <Bouton titre="Valider" onPress={() => setEtape('valider')} style={styles.moitie} />
            </View>
          </Panneau>
        ) : null}

        {enAttente && etape === 'valider' ? (
          <Panneau titre="Valider la boutique" style={styles.espace}>
            <Text style={styles.aide}>Elle deviendra visible des clients et le commerçant sera prévenu.</Text>
            <Bouton titre="Oui, valider" onPress={() => decider('VALIDER')} chargement={envoi} />
            <Bouton titre="Retour" variante="texte" onPress={() => setEtape(null)} />
          </Panneau>
        ) : null}

        {enAttente && etape === 'rejeter' ? (
          <Panneau titre="Rejeter la boutique" style={styles.espace}>
            <Text style={styles.aide}>Choisissez un motif ou écrivez le vôtre. Le commerçant le recevra.</Text>
            <View style={styles.rapides}>
              {REJETS_RAPIDES.map((m) => (
                <Puce key={m} titre={m} actif={motif === m} onPress={() => setMotif(m)} />
              ))}
            </View>
            <ChampTexte label="Motif du rejet (obligatoire)" value={motif} onChangeText={setMotif} multiline autoCapitalize="sentences" />
            <Bouton titre="Confirmer le rejet" variante="danger" onPress={() => decider('REJETER')} chargement={envoi} />
            <Bouton titre="Retour" variante="texte" onPress={() => setEtape(null)} />
          </Panneau>
        ) : null}

        {boutique.statut === 'REJETEE' ? (
          <View style={styles.rejet}>
            <Text style={styles.rejetTitre}>Motif du rejet</Text>
            <Text style={styles.rejetTexte}>{boutique.motifRejet || 'Non précisé'}</Text>
          </View>
        ) : null}

        <Panneau titre="Informations" style={styles.espace}>
          <LigneInfo icone="location" titre="Adresse" valeur={`${boutique.adresse}, ${boutique.ville}`} />
          {boutique.telephone ? <LigneInfo icone="call" titre="Téléphone" valeur={boutique.telephone} /> : null}
          <LigneInfo icone="time" titre="Soumise le" valeur={formatDateHeure(boutique.createdAt)} />
        </Panneau>

        {gerant ? (
          <Panneau titre="Commerçant" style={styles.espace}>
            <LigneInfo icone="person" titre="Nom" valeur={`${gerant.utilisateur.prenom} ${gerant.utilisateur.nom}`} />
            {gerant.nomCommercial ? <LigneInfo icone="briefcase" titre="Nom commercial" valeur={gerant.nomCommercial} /> : null}
            <LigneInfo icone="mail" titre="E-mail" valeur={gerant.utilisateur.email} />
            <LigneInfo icone="call" titre="Téléphone" valeur={gerant.utilisateur.telephone} />
          </Panneau>
        ) : null}

        <Panneau titre="Horaires" style={styles.espace}>
          {ORDRE_JOURS.map((jour) => {
            const h = (boutique.horaires || []).find((x) => x.jour === jour);
            let texte = 'Non renseigné';
            if (h) texte = h.ferme ? 'Fermé' : `${h.heureOuverture} - ${h.heureFermeture}`;
            return (
              <View key={jour} style={styles.ligneHoraire}>
                <Text style={styles.jour}>{JOURS[jour]}</Text>
                <Text style={styles.heures}>{texte}</Text>
              </View>
            );
          })}
        </Panneau>
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  heroZone: { backgroundColor: couleurs.carte, borderRadius: rayon, ...ombre },
  hero: { borderRadius: rayon, padding: espaces.l },
  heroHaut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 60, height: 60, borderRadius: 18 },
  logoInitiale: { backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  lettre: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  heroNom: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginTop: espaces.m },
  heroCategorie: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  heroDescription: { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginTop: espaces.s, lineHeight: 20 },
  deuxBoutons: { flexDirection: 'row', gap: espaces.s },
  moitie: { flex: 1 },
  aide: { fontSize: 14, color: couleurs.texteSecondaire, marginBottom: espaces.m, lineHeight: 20 },
  rapides: { flexDirection: 'row', flexWrap: 'wrap', rowGap: espaces.s, marginBottom: espaces.m },
  rejet: { backgroundColor: couleurs.erreurFond, borderRadius: rayon, padding: espaces.m, marginTop: espaces.m },
  rejetTitre: { fontSize: 13, fontWeight: '700', color: couleurs.erreur },
  rejetTexte: { fontSize: 15, color: couleurs.texte, marginTop: 2 },
  ligneHoraire: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  jour: { fontSize: 14, color: couleurs.texteSecondaire },
  heures: { fontSize: 14, fontWeight: '600', color: couleurs.texte },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});