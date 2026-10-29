import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import ChampRecherche from '../../components/ChampRecherche';
import Panneau from '../../components/Panneau';
import LigneListe from '../../components/LigneListe';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import { couleurs, espaces } from '../../theme';
import { formatDateHeure } from '../../utils/format';

// UC19 : consulter l'historique des clients
export default function ClientsEcran({ navigation }) {
  const { width } = useWindowDimensions();
  const [clients, setClients] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/commercant/clients');
      setClients(data.clients);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  const terme = recherche.trim().toLowerCase();
  const visibles = clients.filter(
    (c) => !terme || `${c.prenom} ${c.nom} ${c.telephone}`.toLowerCase().includes(terme)
  );
  const n = visibles.length;

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}
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
        <ChampRecherche valeur={recherche} onChangeText={setRecherche} placeholder="Rechercher un client..." />
        <View style={styles.espace}>
          <Bandeau type="erreur" message={erreur} />
        </View>

        {chargement ? (
          <Chargement />
        ) : (
          <Panneau titre="Clients" lien={`${n} client${n > 1 ? 's' : ''}`}>
            {n === 0 ? (
              <EtatVide
                titre={terme ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
                message={terme ? null : 'Les clients qui réservent chez vous apparaîtront ici.'}
              />
            ) : (
              visibles.map((c) => (
                <LigneListe
                  key={c.idClient}
                  titre={`${c.prenom} ${c.nom}`}
                  sousTitre={c.telephone}
                  detail={`${c.nombreReservations} réservation${c.nombreReservations > 1 ? 's' : ''} · dernière le ${formatDateHeure(
                    c.derniereReservation
                  )}`}
                  onPress={() => navigation.navigate('ClientDetail', { idClient: c.idClient })}
                  droite={<Ionicons name="chevron-forward" size={20} color={couleurs.texteSecondaire} />}
                />
              ))
            )}
          </Panneau>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginVertical: espaces.s },
});