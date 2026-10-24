import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import EnTetePage from '../../components/EnTetePage';
import Panneau from '../../components/Panneau';
import CarteNotification from '../../components/CarteNotification';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Bouton from '../../components/Bouton';
import { couleurs, espaces } from '../../theme';

const LIMITE = 20;

// UC10 : notifications du client / UC21 : notifications du commerçant
export default function NotificationsEcran() {
  const { width } = useWindowDimensions();
  const large = width >= 900;

  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [nonLues, setNonLues] = useState(0);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async (numeroPage, remplacer) => {
    try {
      setErreur('');
      const { data } = await api.get('/notifications', { params: { page: numeroPage, limite: LIMITE } });
      setTotal(data.total);
      setNonLues(data.nonLues);
      setPage(numeroPage);
      setNotifications((anciennes) => (remplacer ? data.notifications : [...anciennes, ...data.notifications]));
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
      setPlus(false);
    }
  }, []);

  // Recharge à chaque affichage de l'onglet
  useFocusEffect(
    useCallback(() => {
      charger(1, true);
    }, [charger])
  );

  function voirPlus() {
    setPlus(true);
    charger(page + 1, false);
  }

  // Ouvrir une notification la marque comme lue
  async function ouvrir(notification) {
    if (notification.lue) return;
    try {
      await api.get(`/notifications/${notification.idNotification}`);
      setNotifications((liste) =>
        liste.map((n) => (n.idNotification === notification.idNotification ? { ...n, lue: true } : n))
      );
      setNonLues((n) => Math.max(0, n - 1));
    } catch (e) {
      setErreur(messageErreur(e));
    }
  }

  async function toutLire() {
    try {
      await api.patch('/notifications/lire-tout');
      setNotifications((liste) => liste.map((n) => ({ ...n, lue: true })));
      setNonLues(0);
    } catch (e) {
      setErreur(messageErreur(e));
    }
  }

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
          titre="Notifications"
          sousTitre={nonLues > 0 ? `${nonLues} notification${nonLues > 1 ? 's' : ''} non lue${nonLues > 1 ? 's' : ''}` : 'Vous êtes à jour'}
        />

        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : (
          <Panneau
            titre="Activité"
            lien={nonLues > 0 ? 'Tout marquer comme lu' : null}
            onLien={toutLire}
          >
            {notifications.length === 0 ? (
              <EtatVide titre="Aucune notification" />
            ) : (
              notifications.map((n) => (
                <CarteNotification key={n.idNotification} notification={n} onPress={() => ouvrir(n)} />
              ))
            )}
            {notifications.length < total ? (
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
  voirPlus: { marginTop: espaces.s },
});