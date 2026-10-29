import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import CarteReservation from '../../components/CarteReservation';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
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

// UC09 : consulter l'historique des réservations
export default function MesReservationsEcran({ navigation }) {
  const [statut, setStatut] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(
    async (numeroPage, remplacer) => {
      try {
        setErreur('');
        const params = { page: numeroPage, limite: LIMITE };
        if (statut) params.statut = statut;
        const { data } = await api.get('/reservations', { params });
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

  // À chaque fois que l'onglet est affiché (ou que le filtre change), on recharge
  useFocusEffect(
    useCallback(() => {
      charger(1, true);
    }, [charger])
  );

  function choisirFiltre(valeur) {
    setChargement(true);
    setStatut(valeur);
  }

  function chargerPlus() {
    if (plus || chargement || reservations.length >= total) return;
    setPlus(true);
    charger(page + 1, false);
  }

  function rafraichir() {
    setRafraichit(true);
    charger(1, true);
  }

  return (
    <SafeAreaView style={styles.zone}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Mes réservations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.puces}>
          {FILTRES.map((f) => (
            <Puce key={f.titre} titre={f.titre} actif={statut === f.valeur} onPress={() => choisirFiltre(f.valeur)} />
          ))}
        </ScrollView>
        <Bandeau type="erreur" message={erreur} />
      </View>

      {chargement ? (
        <Chargement />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(r) => String(r.idReservation)}
          renderItem={({ item }) => (
            <CarteReservation
              reservation={item}
              onPress={() => navigation.navigate('ReservationDetail', { idReservation: item.idReservation })}
            />
          )}
          contentContainerStyle={styles.liste}
          onEndReached={chargerPlus}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={rafraichit} onRefresh={rafraichir} />}
          ListEmptyComponent={
            erreur ? null : (
              <EtatVide titre="Aucune réservation" message="Réservez dans une boutique pour la voir ici." />
            )
          }
          ListFooterComponent={plus ? <Chargement /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  entete: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: espaces.m, paddingBottom: 0 },
  titre: { fontSize: 22, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.s },
  puces: { paddingVertical: espaces.s },
  liste: { width: '100%', maxWidth: 600, alignSelf: 'center', padding: espaces.m },
});