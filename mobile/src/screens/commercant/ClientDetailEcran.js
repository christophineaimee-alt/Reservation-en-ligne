import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import LigneListe from '../../components/LigneListe';
import LigneInfo from '../../components/LigneInfo';
import BadgeStatut from '../../components/BadgeStatut';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { formatPrix, initiale, libelleQuand } from '../../utils/format';

// UC19 : fiche d'un client et ses réservations dans cette boutique
export default function ClientDetailEcran({ route, navigation }) {
  const { idClient } = route.params;
  const { width } = useWindowDimensions();
  const [client, setClient] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api
      .get(`/commercant/clients/${idClient}`)
      .then(({ data }) => {
        setClient(data.client);
        setReservations(data.reservations);
      })
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [idClient]);

  if (chargement) return <Chargement />;

  if (!client) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <View style={{ padding: espaces.m }}>
          <Bandeau type="erreur" message={erreur || 'Client introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: width >= 900 ? 760 : 600 }]}>
        <View style={styles.heroZone}>
          <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.lettre}>{initiale(client.prenom)}</Text>
            </View>
            <Text style={styles.nom}>{client.prenom} {client.nom}</Text>
            <Text style={styles.sousTitre}>
              {reservations.length} réservation{reservations.length > 1 ? 's' : ''} chez vous
            </Text>
          </LinearGradient>
        </View>

        <Panneau titre="Contact" style={styles.espace}>
          <LigneInfo icone="call" titre="Téléphone" valeur={client.telephone} />
          <Bouton
            titre="Appeler"
            variante="contour"
            onPress={() => Linking.openURL(`tel:${client.telephone}`).catch(() => {})}
          />
        </Panneau>

        <Panneau titre="Réservations" style={styles.espace}>
          {reservations.length === 0 ? (
            <EtatVide titre="Aucune réservation" />
          ) : (
            reservations.map((r) => {
              const element = r.produitService;
              const total = element ? element.prix * r.quantite : 0;
              return (
                <LigneListe
                  key={r.idReservation}
                  avatar={element ? element.nom : '?'}
                  titre={element ? element.nom : 'Élément supprimé'}
                  sousTitre={libelleQuand(r)}
                  detail={formatPrix(total)}
                  onPress={() => navigation.navigate('ReservationCommercantDetail', { idReservation: r.idReservation })}
                  droite={<BadgeStatut statut={r.statut} />}
                />
              );
            })
          )}
        </Panneau>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  heroZone: { backgroundColor: couleurs.carte, borderRadius: rayon, ...ombre },
  hero: { borderRadius: rayon, paddingVertical: espaces.xl, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lettre: { fontSize: 34, fontWeight: '700', color: '#FFFFFF' },
  nom: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginTop: espaces.m },
  sousTitre: { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginTop: 4 },
});