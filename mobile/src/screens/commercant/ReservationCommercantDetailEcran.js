import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import BadgeStatut from '../../components/BadgeStatut';
import LigneInfo from '../../components/LigneInfo';
import Puce from '../../components/Puce';
import { couleurs, degrade, espaces, rayon } from '../../theme';
import {
  formatDateHeure,
  formatDateTexte,
  formatPrix,
  initiale,
  libelleQuand,
  prochainsJours,
} from '../../utils/format';
import { REGEX_HEURE } from '../../utils/saisie';

const REFUS_RAPIDES = ['Créneau indisponible', 'Produit épuisé', 'Fermeture exceptionnelle', 'Service non disponible'];
const ANNULATION_RAPIDES = ['Imprévu de ma part', 'Fermeture exceptionnelle', 'Produit épuisé', 'Personnel absent'];

// UC17 : accepter / UC18 : refuser ou proposer une autre date / annuler une réservation acceptée
export default function ReservationCommercantDetailEcran({ route }) {
  const { idReservation } = route.params;
  const action = route.params ? route.params.action : null;
  const { width } = useWindowDimensions();
  const jours = useMemo(() => prochainsJours(7), []);

  const [reservation, setReservation] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [panneau, setPanneau] = useState(null); // null, 'refuser', 'proposer' ou 'annuler'
  const [actionAppliquee, setActionAppliquee] = useState(false);
  const [motif, setMotif] = useState('');
  const [jour, setJour] = useState(jours[1].valeur);
  const [heure, setHeure] = useState('10:00');
  const [note, setNote] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get(`/commercant/reservations/${idReservation}`);
      setReservation(data.reservation);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, [idReservation]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Venu du bouton « Refuser » ou « Annuler » d'une liste : on ouvre directement le formulaire
  useEffect(() => {
    if (!reservation || actionAppliquee) return;
    setActionAppliquee(true);
    if (action === 'refuser' && reservation.statut === 'EN_ATTENTE') setPanneau('refuser');
    if (action === 'annuler' && reservation.statut === 'ACCEPTEE') setPanneau('annuler');
  }, [reservation, action, actionAppliquee]);

  function ouvrir(nom) {
    setErreur('');
    setSucces('');
    setMotif('');
    setPanneau(nom);
  }

  // Envoie une action, affiche le message du serveur puis recharge la fiche
  async function executer(appel) {
    setErreur('');
    setSucces('');
    setEnvoi(true);
    try {
      const { data } = await appel();
      setSucces(data.message);
      setPanneau(null);
      setMotif('');
      setNote('');
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  const base = `/commercant/reservations/${idReservation}`;

  const accepter = () => executer(() => api.patch(`${base}/acceptation`));

  function refuser() {
    if (!motif.trim()) {
      setErreur('Le motif de refus est obligatoire');
      return;
    }
    executer(() => api.patch(`${base}/refus`, { motif: motif.trim() }));
  }

  function annuler() {
    if (!motif.trim()) {
      setErreur("Le motif d'annulation est obligatoire");
      return;
    }
    executer(() => api.patch(`${base}/annulation`, { motif: motif.trim() }));
  }

  // Refus qui contient la nouvelle date : le client la lira dans le motif
  function proposer() {
    if (!REGEX_HEURE.test(heure)) {
      setErreur('Heure invalide (format HH:mm, par exemple 10:30)');
      return;
    }
    if (new Date(`${jour}T${heure}:00+03:00`) <= new Date()) {
      setErreur('La date proposée doit être dans le futur');
      return;
    }
    const proposition = `Date non disponible. Je vous propose le ${formatDateTexte(jour)} à ${heure}.`;
    const texte = note.trim() ? `${proposition} ${note.trim()}` : proposition;
    executer(() => api.patch(`${base}/refus`, { motif: texte }));
  }

  if (chargement) return <Chargement />;

  if (!reservation) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <View style={{ padding: espaces.m }}>
          <Bandeau type="erreur" message={erreur || 'Demande introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  const element = reservation.produitService;
  const produit = element && element.type === 'PRODUIT';
  const total = element ? element.prix * reservation.quantite : 0;
  const client = reservation.client;
  const nomClient = client ? `${client.prenom} ${client.nom}` : 'Client';
  const statut = reservation.statut;

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}>
        <Bandeau type="succes" message={succes} />
        <Bandeau type="erreur" message={erreur} />

        <Panneau>
          <View style={styles.client}>
            <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.lettre}>{initiale(nomClient)}</Text>
            </LinearGradient>
            <View style={styles.clientTextes}>
              <Text style={styles.clientNom} numberOfLines={1}>{nomClient}</Text>
              {client ? <Text style={styles.clientTel}>{client.telephone}</Text> : null}
            </View>
            {client ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${client.telephone}`).catch(() => {})}
                style={styles.appeler}
              >
                <Ionicons name="call" size={15} color={couleurs.primaire} />
                <Text style={styles.appelerTexte}>Appeler</Text>
              </Pressable>
            ) : null}
          </View>
        </Panneau>

        {statut === 'EN_ATTENTE' && !panneau ? (
          <Panneau titre="Votre décision" style={styles.espace}>
            <View style={styles.deuxBoutons}>
              <Bouton titre="Refuser" variante="danger" onPress={() => ouvrir('refuser')} style={styles.moitie} />
              <Bouton titre="Accepter" onPress={accepter} chargement={envoi} style={styles.moitie} />
            </View>
            <Bouton
              titre="Proposer une autre date"
              variante="contour"
              onPress={() => ouvrir('proposer')}
              style={styles.espaceBouton}
            />
          </Panneau>
        ) : null}

        {statut === 'ACCEPTEE' && !panneau ? (
          <Panneau titre="Un empêchement ?" style={styles.espace}>
            <Text style={styles.aide}>
              Si vous ne pouvez plus honorer cette réservation, annulez-la : le client est prévenu et le stock ou la
              place est libéré.
            </Text>
            <Bouton titre="Annuler la réservation" variante="danger" onPress={() => ouvrir('annuler')} />
          </Panneau>
        ) : null}

        {panneau === 'refuser' || panneau === 'annuler' ? (
          <Panneau titre={panneau === 'refuser' ? 'Refuser la demande' : 'Annuler la réservation'} style={styles.espace}>
            <Text style={styles.aide}>Choisissez un motif ou écrivez le vôtre. Le client le recevra.</Text>
            <View style={styles.rapides}>
              {(panneau === 'refuser' ? REFUS_RAPIDES : ANNULATION_RAPIDES).map((m) => (
                <Puce key={m} titre={m} actif={motif === m} onPress={() => setMotif(m)} />
              ))}
            </View>
            <ChampTexte
              label="Motif (obligatoire)"
              value={motif}
              onChangeText={setMotif}
              multiline
              maxLength={300}
              autoCapitalize="sentences"
            />
            <Bouton
              titre={panneau === 'refuser' ? 'Confirmer le refus' : "Confirmer l'annulation"}
              variante="danger"
              onPress={panneau === 'refuser' ? refuser : annuler}
              chargement={envoi}
            />
            <Bouton titre="Retour" variante="texte" onPress={() => setPanneau(null)} />
          </Panneau>
        ) : null}

        {panneau === 'proposer' ? (
          <Panneau titre="Proposer une autre date" style={styles.espace}>
            <Text style={styles.aide}>
              La demande actuelle est refusée et le client reçoit votre proposition. Il pourra réserver à nouveau à
              cette date.
            </Text>
            <Text style={styles.label}>Jour proposé</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.defile}>
              {jours.map((j) => (
                <Puce key={j.valeur} titre={j.libelle} actif={jour === j.valeur} onPress={() => setJour(j.valeur)} />
              ))}
            </ScrollView>
            <ChampTexte label="Heure proposée (HH:mm)" value={heure} onChangeText={setHeure} maxLength={5} placeholder="10:00" />
            <ChampTexte label="Message (facultatif)" value={note} onChangeText={setNote} maxLength={150} autoCapitalize="sentences" />
            <Bouton titre="Envoyer la proposition" onPress={proposer} chargement={envoi} />
            <Bouton titre="Retour" variante="texte" onPress={() => setPanneau(null)} />
          </Panneau>
        ) : null}

        <Panneau style={styles.espace}>
          <View style={styles.entete}>
            <Text style={styles.numero}>Demande n° {reservation.idReservation}</Text>
            <BadgeStatut statut={statut} />
          </View>
          <Text style={styles.nom}>{element ? element.nom : 'Élément supprimé'}</Text>

          <LigneInfo icone="calendar" titre={produit ? 'Retrait' : 'Rendez-vous'} valeur={libelleQuand(reservation)} />
          {produit ? <LigneInfo icone="cube" titre="Quantité" valeur={String(reservation.quantite)} /> : null}
          <LigneInfo icone="cash" titre="Total" valeur={formatPrix(total)} />
          {reservation.remarque ? (
            <LigneInfo icone="chatbubble-ellipses" titre="Remarque du client" valeur={reservation.remarque} />
          ) : null}
          <LigneInfo icone="time" titre="Demandée le" valeur={formatDateHeure(reservation.createdAt)} />
          {statut === 'EN_ATTENTE' && reservation.dateExpiration ? (
            <LigneInfo icone="hourglass" titre="Réponse attendue avant" valeur={formatDateHeure(reservation.dateExpiration)} />
          ) : null}
        </Panneau>

        {(statut === 'REFUSEE' || statut === 'ANNULEE') && reservation.motifRefus ? (
          <View style={styles.motif}>
            <Text style={styles.motifTitre}>{statut === 'REFUSEE' ? 'Motif du refus' : "Motif de l'annulation"}</Text>
            <Text style={styles.motifTexte}>{reservation.motifRefus}</Text>
          </View>
        ) : null}

        {statut === 'EXPIREE' ? <Text style={styles.note}>Cette demande a expiré sans réponse.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  espaceBouton: { marginTop: espaces.s },
  deuxBoutons: { flexDirection: 'row', gap: espaces.s },
  moitie: { flex: 1 },
  client: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  lettre: { color: '#FFFFFF', fontWeight: '700', fontSize: 19 },
  clientTextes: { flex: 1 },
  clientNom: { fontSize: 17, fontWeight: '700', color: couleurs.texte },
  clientTel: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },
  appeler: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: couleurs.primaireClair,
  },
  appelerTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { fontSize: 13, color: couleurs.texteSecondaire },
  nom: { fontSize: 22, fontWeight: '600', color: couleurs.texte, marginTop: espaces.xs, marginBottom: espaces.s },
  motif: { backgroundColor: couleurs.erreurFond, borderRadius: rayon, padding: espaces.m, marginTop: espaces.m },
  motifTitre: { fontSize: 13, fontWeight: '700', color: couleurs.erreur },
  motifTexte: { fontSize: 15, color: couleurs.texte, marginTop: 2 },
  note: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: espaces.m },
  aide: { fontSize: 14, color: couleurs.texteSecondaire, marginBottom: espaces.m, lineHeight: 20 },
  rapides: { flexDirection: 'row', flexWrap: 'wrap', rowGap: espaces.s, marginBottom: espaces.m },
  label: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.xs },
  defile: { flexGrow: 0, marginBottom: espaces.m },
});