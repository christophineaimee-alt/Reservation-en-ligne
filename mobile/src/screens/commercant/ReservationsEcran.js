import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import useNonLues from '../../hooks/useNonLues';
import EnTetePage from '../../components/EnTetePage';
import Panneau from '../../components/Panneau';
import LigneReservation from '../../components/LigneReservation';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Bouton from '../../components/Bouton';
import Puce from '../../components/Puce';
import { couleurs, espaces } from '../../theme';

const LIMITE = 10;

const FILTRES = [
  { titre: 'Toutes', valeur: null },
  { titre: 'En attente', valeur: 'EN_ATTENTE' },
  { titre: 'Acceptées', valeur: 'ACCEPTEE' },
  { titre: 'Refusées', valeur: 'REFUSEE' },
  { titre: 'Annulées', valeur: 'ANNULEE' },
  { titre: 'Expirées', valeur: 'EXPIREE' },
];

// UC16 : gérer les réservations / UC17 : accepter / UC18 : refuser (depuis la fiche)
export default function ReservationsEcran({ navigation, route }) {
  const nonLues = useNonLues();
  const { width } = useWindowDimensions();
  const large = width >= 900;

  const [statut, setStatut] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [occupe, setOccupe] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  // Raccourci depuis le tableau de bord (ex. « Demandes en attente »)
  const cle = route.params ? route.params.cle : null;
  const statutDemande = route.params ? route.params.statut : null;
  useEffect(() => {
    if (cle) {
      setChargement(true);
      setStatut(statutDemande || null);
    }
  }, [cle, statutDemande]);

  const charger = useCallback(
    async (numeroPage, remplacer) => {
      try {
        setErreur('');
        const params = { page: numeroPage, limite: LIMITE };
        if (statut) params.statut = statut;
        const { data } = await api.get('/commercant/reservations', { params });
        setTotal(data.total);
        setPage(numeroPage);
        setReservations((anciennes) => (remplacer ? data.reservations : [...anciennes, ...data.reservations]));
      } catch (e) {
        setErreur(messageErreur(e));
      } finally {
        setChargement(false);
        setRafraichit(false);
        setPlus(false);
      }
    },
    [statut]
  );

  useFocusEffect(
    useCallback(() => {
      charger(1, true);
    }, [charger])
  );

  function choisirFiltre(valeur) {
    setChargement(true);
    setStatut(valeur);
  }

  function voirPlus() {
    setPlus(true);
    charger(page + 1, false);
  }

  async function accepter(idReservation) {
    try {
      setOccupe(idReservation);
      setErreur('');
      await api.patch(`/commercant/reservations/${idReservation}/acceptation`);
      await charger(1, true);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setOccupe(null);
    }
  }

    const ouvrir = (idReservation, action) =>
    navigation.navigate('ReservationCommercantDetail', { idReservation, action });

  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: large ? 1100 : 600 }]}
        refreshControl={
          <RefreshControl
            refreshing={rafraichit}
            onRefresh={() => {
              setRafraichit(true);
              charger(1, true);
            }}
          />
        }
      >
        <EnTetePage
          titre="Réservations"
          sousTitre="Acceptez ou refusez les demandes de vos clients"
          nonLues={nonLues}
          onNotifications={() => navigation.navigate('Notifications')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.defilement}
          contentContainerStyle={styles.puces}
        >
          {FILTRES.map((f) => (
            <Puce key={f.titre} titre={f.titre} actif={statut === f.valeur} onPress={() => choisirFiltre(f.valeur)} />
          ))}
        </ScrollView>

        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : (
          <Panneau titre="Activité" lien={`${total} demande${total > 1 ? 's' : ''}`}>
            {reservations.length === 0 ? (
              <EtatVide titre="Aucune demande de réservation" />
            ) : (
              reservations.map((r) => (
                <LigneReservation
                  key={r.idReservation}
                  reservation={r}
                  mode="commercant"
                  occupe={occupe === r.idReservation}
                  onAccepter={() => accepter(r.idReservation)}
                  onRefuser={() => ouvrir(r.idReservation, 'refuser')}
                  onAnnuler={() => ouvrir(r.idReservation, 'annuler')}
                  onPress={() => ouvrir(r.idReservation)}
                />
              ))
            )}
            {reservations.length < total ? (
              <View style={styles.voirPlus}>
                <Bouton titre="Voir plus" variante="contour" onPress={voirPlus} chargement={plus} />
              </View>
            ) : null}
          </Panneau>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  defilement: { marginHorizontal: -espaces.m, marginBottom: espaces.s },
  puces: { paddingHorizontal: espaces.m, paddingVertical: 6 },
  voirPlus: { marginTop: espaces.s },
});