import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import CarteNotification from '../../components/CarteNotification';
import EcranSecurise from '../../components/EcranSecurise';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, espaces } from '../../theme';

const LIMITE = 20;

function Contenu({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [nonLues, setNonLues] = useState(0);
  const [page, setPage] = useState(1);
  const [filtre, setFiltre] = useState('tout');
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async (numeroPage, remplacer) => {
    try {
      setErreur('');
      const { data } = await api.get('/notifications', { params: { page: numeroPage, limite: LIMITE } });
      const liste = Array.isArray(data.notifications) ? data.notifications : [];
      setTotal(Number(data.total) || liste.length);
      setNonLues(Number(data.nonLues) || 0);
      setPage(numeroPage);
      setNotifications((anciennes) => (remplacer ? liste : [...anciennes, ...liste]));
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
      setPlus(false);
    }
  }, []);

  // Recharge à chaque fois que l'écran est affiché (donc aussi au retour du détail)
  useFocusEffect(
    useCallback(() => {
      charger(1, true);
    }, [charger])
  );

  function chargerPlus() {
    if (plus || chargement || notifications.length >= total) return;
    setPlus(true);
    charger(page + 1, false);
  }

  // Toucher une notification : on ouvre son détail et on la marque comme lue
  function ouvrir(notification) {
    if (!notification.lue) {
      setNotifications((liste) =>
        liste.map((n) => (n.idNotification === notification.idNotification ? { ...n, lue: true } : n))
      );
      setNonLues((n) => Math.max(0, n - 1));
      api.get(`/notifications/${notification.idNotification}`).catch(() => {});
    }
    navigation.navigate('NotificationDetail', { notification: { ...notification, lue: true } });
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

  const visibles = filtre === 'nonlues' ? notifications.filter((n) => !n.lue) : notifications;

  return (
    <SafeAreaView style={styles.zone}>
      <View style={styles.entete}>
        <View style={styles.ligneTitre}>
          <View style={{ flex: 1 }}>
            <Text style={styles.titre}>Notifications</Text>
            <Text style={styles.sousTitre}>
              {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Tout est à jour'}
            </Text>
          </View>
          {nonLues > 0 ? (
            <Pressable onPress={toutLire} hitSlop={8}>
              <Text style={styles.lien}>Tout marquer comme lu</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.filtres}>
          <Puce titre="Toutes" actif={filtre === 'tout'} onPress={() => setFiltre('tout')} />
          <Puce titre="Non lues" actif={filtre === 'nonlues'} onPress={() => setFiltre('nonlues')} />
        </View>
        <Bandeau type="erreur" message={erreur} />
      </View>

      {chargement ? (
        <Chargement />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={visibles}
          keyExtractor={(n) => String(n.idNotification)}
          renderItem={({ item }) => <CarteNotification notification={item} onPress={() => ouvrir(item)} />}
          contentContainerStyle={styles.liste}
          onEndReached={chargerPlus}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={rafraichit}
              onRefresh={() => {
                setRafraichit(true);
                charger(1, true);
              }}
            />
          }
          ListEmptyComponent={erreur ? null : <EtatVide titre={filtre === 'nonlues' ? 'Aucune notification non lue' : 'Aucune notification'} />}
          ListFooterComponent={plus ? <Chargement /> : null}
        />
      )}
    </SafeAreaView>
  );
}

export default function NotificationsEcran(props) {
  useThemeVersion();
  return (
    <EcranSecurise>
      <Contenu {...props} />
    </EcranSecurise>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  entete: { width: '100%', maxWidth: 700, alignSelf: 'center', paddingHorizontal: espaces.m, paddingTop: espaces.m },
  ligneTitre: { flexDirection: 'row', alignItems: 'flex-end', gap: espaces.m },
  titre: { fontSize: 28, fontWeight: '700', color: couleurs.texte },
  sousTitre: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 2 },
  lien: { fontSize: 13, fontWeight: '700', color: couleurs.primaire, marginBottom: 4 },
  filtres: { flexDirection: 'row', marginTop: espaces.m, marginBottom: espaces.s },
  liste: { width: '100%', maxWidth: 700, alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});