import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import { useBoutique } from '../../context/BoutiqueContext';
import EnTetePage from '../../components/EnTetePage';
import BandeauChiffres from '../../components/BandeauChiffres';
import CarteVedette from '../../components/CarteVedette';
import Panneau from '../../components/Panneau';
import GraphiqueCourbe from '../../components/GraphiqueCourbe';
import Calendrier from '../../components/Calendrier';
import LigneReservation from '../../components/LigneReservation';
import LigneMenu from '../../components/LigneMenu';
import BadgeStatut from '../../components/BadgeStatut';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import Puce from '../../components/Puce';
import { couleurs, espaces, rayon } from '../../theme';
import EvaluationPaiements from '../../components/EvaluationPaiements';

const PERIODES = [
  { titre: "Aujourd'hui", valeur: 'jour' },
  { titre: '7 jours', valeur: 'semaine' },
  { titre: '30 jours', valeur: 'mois' },
];
const ORDRE_STATUTS = ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'ANNULEE', 'EXPIREE'];

function ymdLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function pluriel(n, mot) {
  return `${n} ${mot}${n > 1 ? 's' : ''}`;
}

// UC20 : consulter le tableau de bord (+ UC16, UC17 : activité récente)
export default function TableauBordEcran({ navigation }) {
  const { boutique } = useBoutique();
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [periode, setPeriode] = useState('jour');
  const [donnees, setDonnees] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [attente, setAttente] = useState([]);
  const [paiements, setPaiements] = useState(null);
  const [avis, setAvis] = useState(null);
  const [nonLues, setNonLues] = useState(0);
  const [jourChoisi, setJourChoisi] = useState(ymdLocal(new Date()));
  const [occupe, setOccupe] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    try {
      setErreur('');

        const [tableau, notifications, listeRecente, listeAttente, evaluation, listeAvis] = await Promise.all([
        api.get('/commercant/tableau-de-bord', { params: { periode } }),
        api.get('/notifications', { params: { limite: 1 } }),
        api.get('/commercant/reservations', { params: { limite: 30 } }).catch(() => null),
        api.get('/commercant/reservations', { params: { statut: 'EN_ATTENTE', limite: 3 } }).catch(() => null),
        api.get('/commercant/paiements', { params: { periode } }).catch(() => null),
        api.get('/commercant/avis', { params: { limite: 1 } }).catch(() => null),
      ]);
      setDonnees(tableau.data);
      setNonLues(notifications.data.nonLues);
      setRecentes(listeRecente ? listeRecente.data.reservations : []);
      setAttente(listeAttente ? listeAttente.data.reservations : []);
      setPaiements(evaluation ? evaluation.data : null);
      setAvis(listeAvis ? listeAvis.data : null);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, [periode]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  function choisirPeriode(valeur) {
    setChargement(true);
    setPeriode(valeur);
  }

  async function accepter(idReservation) {
    try {
      setOccupe(idReservation);
      setErreur('');
      await api.patch(`/commercant/reservations/${idReservation}/acceptation`);
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setOccupe(null);
    }
  }

  // Réservations reçues sur les 7 derniers jours
  const serie = useMemo(() => {
    const jours = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      jours.push({ cle: ymdLocal(d), libelle: String(d.getDate()), valeur: 0 });
    }
    recentes.forEach((r) => {
      const jour = jours.find((j) => j.cle === ymdLocal(new Date(r.createdAt)));
      if (jour) jour.valeur += 1;
    });
    return jours;
  }, [recentes]);

  // Jours où une réservation a lieu (points sous les dates du calendrier)
  const marques = useMemo(
    () =>
      recentes
        .map((r) => {
          if (r.creneau) return String(r.creneau.date).slice(0, 10);
          if (r.dateHeure) return ymdLocal(new Date(r.dateHeure));
          return '';
        })
        .filter(Boolean),
    [recentes]
  );
  const nombreCeJour = marques.filter((m) => m === jourChoisi).length;

  const taux = donnees && donnees.tauxAcceptation !== null ? `${donnees.tauxAcceptation} %` : '—';
  const total = donnees ? donnees.reservationsPeriode.total : 0;
  const parStatut = donnees ? donnees.reservationsPeriode.parStatut : {};

  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: large ? 1100 : 600 }]}
        refreshControl={
          <RefreshControl
            refreshing={rafraichit}
            onRefresh={() => {
              setRafraichit(true);
              charger();
            }}
          />
        }
      >
        <EnTetePage
          titre="Bon retour"
          sousTitre={boutique ? `${boutique.nom} · voici ce qui se passe dans votre boutique` : 'Voici ce qui se passe dans votre boutique'}
          nonLues={nonLues}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        {boutique && boutique.statut === 'EN_ATTENTE' ? (
          <View style={styles.info}>
            <Text style={styles.infoTitre}>Boutique en attente de validation</Text>
            <Text style={styles.infoTexte}>
              Les clients ne la voient pas encore. Vous pouvez déjà préparer votre catalogue, vos horaires et vos
              créneaux.
            </Text>
          </View>
        ) : null}
        {boutique && boutique.statut === 'REJETEE' ? (
          <View style={[styles.info, styles.rejet]}>
            <Text style={[styles.infoTitre, { color: couleurs.erreur }]}>Boutique rejetée</Text>
            <Text style={styles.infoTexte}>Motif : {boutique.motifRejet || 'non précisé'}</Text>
            <Bouton
              titre="Corriger ma boutique"
              onPress={() => navigation.navigate('MaBoutique')}
              style={{ marginTop: espaces.s }}
            />
          </View>
        ) : null}

        <View style={styles.periodes}>
          {PERIODES.map((p) => (
            <Puce key={p.valeur} titre={p.titre} actif={periode === p.valeur} onPress={() => choisirPeriode(p.valeur)} />
          ))}
        </View>
        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : donnees ? (
          <View>
            <BandeauChiffres
              items={[
                { titre: "Aujourd'hui", valeur: donnees.reservationsDuJour, note: 'réservations', ton: 'neutre' },
                { titre: 'Sur la période', valeur: total, note: 'au total', ton: 'neutre' },
                {
                  titre: 'Acceptation',
                  valeur: taux,
                  note: donnees.tauxAcceptation === null ? undefined : donnees.tauxAcceptation >= 50 ? 'bon taux' : 'à améliorer',
                  ton: donnees.tauxAcceptation !== null && donnees.tauxAcceptation < 50 ? 'baisse' : 'hausse',
                },
              ]}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cartes}
              style={styles.defilement}
            >
              <CarteVedette
                vedette
                icone="time"
                petitTitre="À traiter"
                titre={pluriel(donnees.demandesEnAttente, 'demande')}
                pourcentage={total > 0 ? Math.round(((parStatut.EN_ATTENTE || 0) * 100) / total) : 0}
                onPress={() => navigation.navigate('Reservations', { statut: 'EN_ATTENTE', cle: Date.now() })}
              />
              <CarteVedette
                icone="checkmark-circle"
                petitTitre="Acceptées"
                titre={pluriel(parStatut.ACCEPTEE || 0, 'réservation')}
                pourcentage={donnees.tauxAcceptation || 0}
                onPress={() => navigation.navigate('Reservations', { statut: 'ACCEPTEE', cle: Date.now() })}
              />
              <CarteVedette
                icone="cube"
                petitTitre="Stock à surveiller"
                titre={pluriel(donnees.stockFaible.length, 'alerte')}
                onPress={() => navigation.navigate('Catalogue')}
              />
              <CarteVedette
                icone="star"
                petitTitre={avis ? `${avis.resume.nombreAvis} avis` : 'Avis clients'}
                titre={avis && avis.resume.nombreAvis > 0 ? `${avis.resume.noteMoyenne} / 5` : 'Aucun avis'}
                pourcentage={avis ? Math.round(avis.resume.noteMoyenne * 20) : 0}
                onPress={() => navigation.navigate('Avis')}
              />
            </ScrollView>

            <View style={[styles.deuxColonnes, large && styles.enLigne]}>
              <Panneau titre="Réservations reçues" lien="7 derniers jours" style={large ? { flex: 2 } : null}>
                <GraphiqueCourbe donnees={serie} />
              </Panneau>
              <Panneau titre="Calendrier" style={large ? { flex: 1 } : null}>
                <Calendrier choisi={jourChoisi} onChoisir={setJourChoisi} marques={marques} />
                <Text style={styles.jourInfo}>
                  {nombreCeJour > 0 ? `${pluriel(nombreCeJour, 'réservation')} ce jour-là` : 'Aucune réservation ce jour-là'}
                </Text>
              </Panneau>
            </View>
              {paiements ? (
              <View style={styles.espace}>
                <EvaluationPaiements
                  donnees={paiements}
                  libellePeriode={(PERIODES.find((p) => p.valeur === periode) || {}).titre}
                />
              </View>
            ) : null}
            <Panneau
              titre="Activité"
              lien="Voir tout"
              onLien={() => navigation.navigate('Reservations', { statut: 'EN_ATTENTE', cle: Date.now() })}
              style={styles.espace}
            >
              {attente.length === 0 ? (
                <Text style={styles.vide}>Aucune demande en attente pour le moment.</Text>
              ) : (
                attente.map((r) => (
                                   <LigneReservation
                    key={r.idReservation}
                    reservation={r}
                    mode="commercant"
                    occupe={occupe === r.idReservation}
                    onAccepter={() => accepter(r.idReservation)}
                    onRefuser={() =>
                      navigation.navigate('ReservationCommercantDetail', { idReservation: r.idReservation, action: 'refuser' })
                    }
                    onPress={() => navigation.navigate('ReservationCommercantDetail', { idReservation: r.idReservation })}
                  />
                ))
              )}
            </Panneau>

            <View style={[styles.deuxColonnes, large && styles.enLigne, styles.espace]}>
              <Panneau titre="Répartition sur la période" style={large ? { flex: 1 } : null}>
                {ORDRE_STATUTS.map((s) => (
                  <View key={s} style={styles.ligneStatut}>
                    <BadgeStatut statut={s} />
                    <Text style={styles.compte}>{parStatut[s] || 0}</Text>
                  </View>
                ))}
              </Panneau>
              <Panneau titre="Stock à surveiller" style={large ? { flex: 1 } : null}>
                {donnees.stockFaible.length === 0 ? (
                  <Text style={styles.vide}>Aucun produit en stock faible.</Text>
                ) : (
                  donnees.stockFaible.map((s) => (
                    <LigneMenu
                      key={s.idProduitService}
                      titre={s.nom}
                      description={s.quantite === 0 ? 'Rupture de stock' : `${s.quantite} restant(s) · seuil ${s.seuilAlerte}`}
                      onPress={() => navigation.navigate('Catalogue')}
                    />
                  ))
                )}
              </Panneau>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  info: { backgroundColor: '#FFF4DB', borderRadius: rayon, padding: espaces.m, marginBottom: espaces.m },
  rejet: { backgroundColor: couleurs.erreurFond },
  infoTitre: { fontSize: 15, fontWeight: '700', color: couleurs.attention },
  infoTexte: { fontSize: 14, color: couleurs.texte, marginTop: espaces.xs },
  periodes: { flexDirection: 'row', marginBottom: espaces.m },
  defilement: { marginHorizontal: -espaces.m },
  cartes: { paddingHorizontal: espaces.m, paddingTop: 4, paddingBottom: espaces.m, gap: espaces.m },
  deuxColonnes: { gap: espaces.m },
  enLigne: { flexDirection: 'row', alignItems: 'flex-start' },
  espace: { marginTop: espaces.m },
  jourInfo: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: espaces.s, textAlign: 'center' },
  vide: { fontSize: 14, color: couleurs.texteSecondaire },
  ligneStatut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: espaces.xs },
  compte: { fontSize: 16, fontWeight: '700', color: couleurs.texte },
});