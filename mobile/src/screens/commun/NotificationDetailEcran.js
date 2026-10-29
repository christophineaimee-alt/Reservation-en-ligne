import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import EcranSecurise from '../../components/EcranSecurise';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, espaces, rayon, ombre } from '../../theme';
import { formatDateHeure } from '../../utils/format';
import { destinationNotification, libelleType, visuelNotification } from '../../utils/notificationsVisuel';

function Contenu({ route, navigation }) {
  const { utilisateur } = useAuth();
  const role = utilisateur ? utilisateur.role : null;
  const params = route.params || {};
  const [notification, setNotification] = useState(params.notification || null);
  const [chargement, setChargement] = useState(!params.notification && !!params.idNotification);
  const [erreur, setErreur] = useState('');

  // Si on arrive avec seulement un identifiant, on charge la notification (cela la marque lue)
  useEffect(() => {
    if (params.notification || !params.idNotification) return undefined;
    let actif = true;
    api
      .get(`/notifications/${params.idNotification}`)
      .then(({ data }) => {
        if (actif) setNotification(data.notification || data);
      })
      .catch((e) => {
        if (actif) setErreur(messageErreur(e));
      })
      .finally(() => {
        if (actif) setChargement(false);
      });
    return () => {
      actif = false;
    };
  }, [params.notification, params.idNotification]);

  if (chargement) return <Chargement />;
  if (!notification) {
    return (
      <SafeAreaView style={styles.zone}>
        <View style={styles.contenu}>
          <Bandeau type="erreur" message={erreur || 'Notification introuvable'} />
          <Bouton titre="Retour" variante="contour" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const v = visuelNotification(notification.typeNotification);
  const destination = destinationNotification(notification, role);

  function ouvrirElement() {
    if (!destination) return;
    if (destination.params) navigation.navigate(destination.ecran, destination.params);
    else navigation.navigate(destination.ecran);
  }

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.carte}>
          <View style={[styles.icone, { backgroundColor: v.fond }]}>
            <Ionicons name={v.icone} size={32} color={v.couleur} />
          </View>
          <View style={styles.etiquettes}>
            <View style={[styles.etiquette, { backgroundColor: v.fond }]}>
              <Text style={[styles.etiquetteTexte, { color: v.couleur }]}>{libelleType(notification.typeNotification)}</Text>
            </View>
            <View style={[styles.etiquette, { backgroundColor: couleurs.succesFond }]}>
              <Text style={[styles.etiquetteTexte, { color: couleurs.succes }]}>Lue</Text>
            </View>
          </View>
          <Text style={styles.titre}>{String(notification.titre || 'Notification')}</Text>
          {notification.dateEnvoi ? <Text style={styles.date}>Reçue le {formatDateHeure(notification.dateEnvoi)}</Text> : null}
          <View style={styles.separateur} />
          <Text selectable style={styles.message}>{String(notification.message || '')}</Text>
        </View>

        {destination ? <Bouton titre={destination.libelle} onPress={ouvrirElement} style={styles.bouton} /> : null}
        <Bouton titre="Retour aux notifications" variante="contour" onPress={() => navigation.goBack()} style={styles.bouton} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function NotificationDetailEcran(props) {
  useThemeVersion();
  return (
    <EcranSecurise>
      <Contenu {...props} />
    </EcranSecurise>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  carte: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.l, ...ombre },
  icone: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  etiquettes: { flexDirection: 'row', gap: 8, marginTop: espaces.m },
  etiquette: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  etiquetteTexte: { fontSize: 12, fontWeight: '700' },
  titre: { fontSize: 22, fontWeight: '700', color: couleurs.texte, marginTop: espaces.m },
  date: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4 },
  separateur: { height: 1, backgroundColor: couleurs.bordure, marginVertical: espaces.m },
  message: { fontSize: 15, color: couleurs.texte, lineHeight: 23 },
  bouton: { marginTop: espaces.m },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});