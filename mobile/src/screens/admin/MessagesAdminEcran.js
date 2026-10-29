import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
/*
import React, { useCallback, useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import EnTetePage from '../../components/EnTetePage';
import BandeauChiffres from '../../components/BandeauChiffres';
import Panneau from '../../components/Panneau';
import Puce from '../../components/Puce';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, espaces } from '../../theme';
import { formatDateHeure } from '../../utils/format';

const FILTRES = [
  { titre: 'Tous', valeur: '' },
  { titre: 'Non lus', valeur: 'false' },
  { titre: 'Lus', valeur: 'true' },
];

// Messages du formulaire « Nous contacter »
export default function MessagesAdminEcran({ navigation }) {
  useThemeVersion();
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [filtre, setFiltre] = useState('');
  const [donnees, setDonnees] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [occupe, setOccupe] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(
    async (numero = 1) => {
      try {
        setErreur('');
        const { data } = await api.get('/admin/messages', {
          params: { page: numero, limite: 20, lu: filtre || undefined },
        });
        setDonnees(data);
        setPage(numero);
        setMessages((anciens) => (numero === 1 ? data.messages : [...anciens, ...data.messages]));
      } catch (e) {
        setErreur(messageErreur(e));
      } finally {
        setChargement(false);
        setRafraichit(false);
        setPlus(false);
      }
    },
    [filtre]
  );

  useFocusEffect(
    useCallback(() => {
      charger(1);
    }, [charger])
  );

  function choisirFiltre(valeur) {
    setChargement(true);
    setFiltre(valeur);
  }

  async function marquerLu(m) {
    setOccupe(m.idMessage);
    try {
      await api.patch(`/admin/messages/${m.idMessage}/lu`);
      await charger(1);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setOccupe(null);
    }
  }

  function repondre(m) {
    Linking.openURL(`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.sujet}`)}`);
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
              charger(1);
            }}
          />
        }
      >
        <EnTetePage
          titre="Messages"
          sousTitre="Messages reçus via le formulaire de contact"
          onNotifications={() => navigation.navigate('Notifications')}
        />
        <Bandeau type="erreur" message={erreur} />

        {chargement && !donnees ? (
          <Chargement />
        ) : donnees ? (
          <View>
            <BandeauChiffres
              items={[
                { titre: 'Non lus', valeur: donnees.nonLus, note: donnees.nonLus > 0 ? 'à lire' : 'à jour', ton: donnees.nonLus > 0 ? 'baisse' : 'hausse' },
                { titre: 'Affichés', valeur: donnees.total, note: 'messages', ton: 'neutre' },
              ]}
            />

            <Panneau titre="Boîte de réception">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres}>
                {FILTRES.map((f) => (
                  <Puce key={f.valeur} titre={f.titre} actif={filtre === f.valeur} onPress={() => choisirFiltre(f.valeur)} />
                ))}
              </ScrollView>

              {messages.length === 0 ? (
                <Text style={styles.vide}>Aucun message.</Text>
              ) : (
                messages.map((m) => (
                  <View key={m.idMessage} style={[styles.carte, !m.lu && styles.carteNonLue]}>
                    <View style={styles.haut}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nom}>{m.nom}</Text>
                        <Text style={styles.email}>{m.email}</Text>
                      </View>
                      {!m.lu ? (
                        <View style={styles.nouveau}>
                          <Text style={styles.nouveauTexte}>Nouveau</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.sujet}>{m.sujet}</Text>
                    <Text style={styles.message}>{m.message}</Text>
                    <Text style={styles.date}>{formatDateHeure(m.createdAt)}</Text>
                    <View style={styles.liens}>
                      <Pressable onPress={() => repondre(m)} style={styles.lienLigne}>
                        <Ionicons name="mail-outline" size={16} color={couleurs.primaire} />
                        <Text style={styles.lien}>Répondre par e-mail</Text>
                      </Pressable>
                      {!m.lu ? (
                        <Pressable onPress={() => marquerLu(m)} disabled={occupe === m.idMessage} style={styles.lienLigne}>
                          <Ionicons name="checkmark-done-outline" size={16} color={couleurs.primaire} />
                          <Text style={styles.lien}>Marquer comme lu</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))
              )}

              {messages.length < donnees.total ? (
                <Bouton
                  titre="Voir plus de messages"
                  variante="contour"
                  chargement={plus}
                  onPress={() => {
                    setPlus(true);
                    charger(page + 1);
                  }}
                />
              ) : null}
            </Panneau>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  filtres: { marginBottom: espaces.m },
  vide: { fontSize: 14, color: couleurs.texteSecondaire },
  carte: { backgroundColor: couleurs.surface2, borderRadius: 16, padding: espaces.m, marginBottom: espaces.s + 2 },
  carteNonLue: { borderLeftWidth: 4, borderLeftColor: couleurs.primaire },
  haut: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  nom: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  email: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 1 },
  nouveau: { backgroundColor: couleurs.primaireClair, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  nouveauTexte: { fontSize: 11, fontWeight: '700', color: couleurs.primaire },
  sujet: { fontSize: 14, fontWeight: '700', color: couleurs.texte, marginTop: espaces.s + 2 },
  message: { fontSize: 14, color: couleurs.texte, marginTop: 4, lineHeight: 20 },
  date: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: espaces.s },
  liens: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m, marginTop: espaces.s + 4 },
  lienLigne: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lien: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});
*/

import React, { useCallback, useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import EnTetePage from '../../components/EnTetePage';
import BandeauChiffres from '../../components/BandeauChiffres';
import Panneau from '../../components/Panneau';
import Puce from '../../components/Puce';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, espaces } from '../../theme';
import { formatDateHeure } from '../../utils/format';
const FILTRES = [
  { titre: 'Tous', valeur: '' },
  { titre: 'Non lus', valeur: 'false' },
  { titre: 'Lus', valeur: 'true' },
];
// Messages du formulaire « Nous contacter »
export default function MessagesAdminEcran({ navigation }) {
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [filtre, setFiltre] = useState('');
  const [donnees, setDonnees] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [occupe, setOccupe] = useState(null);
  const [erreur, setErreur] = useState('');
  const charger = useCallback(
    async (numero = 1) => {
      try {
        setErreur('');
        const { data } = await api.get('/admin/messages', {
          params: { page: numero, limite: 20, lu: filtre || undefined },
        });
        setDonnees(data);
        setPage(numero);
        setMessages((anciens) => (numero === 1 ? data.messages : [...anciens, ...data.messages]));
      } catch (e) {
        setErreur(messageErreur(e));
      } finally {
        setChargement(false);
        setRafraichit(false);
        setPlus(false);
      }
    },
    [filtre]
  );
  useFocusEffect(
    useCallback(() => {
      charger(1);
    }, [charger])
  );
  function choisirFiltre(valeur) {
    setChargement(true);
    setFiltre(valeur);
  }
  async function marquerLu(m) {
    setOccupe(m.idMessage);
    try {
      await api.patch(`/admin/messages/${m.idMessage}/lu`);
      await charger(1);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setOccupe(null);
    }
  }
  function repondre(m) {
    Linking.openURL(`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.sujet}`)}`);
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
              charger(1);
            }}
          />
        }
      >
        <EnTetePage
          titre="Messages"
          sousTitre="Messages reçus via le formulaire de contact"
          onNotifications={() => navigation.navigate('Notifications')}
        />
        <Bandeau type="erreur" message={erreur} />
        {chargement && !donnees ? (
          <Chargement />
        ) : donnees ? (
          <View>
            <BandeauChiffres
              items={[
                { titre: 'Non lus', valeur: donnees.nonLus, note: donnees.nonLus > 0 ? 'à lire' : 'à jour', ton: donnees.nonLus > 0 ? 'baisse' : 'hausse' },
                { titre: 'Affichés', valeur: donnees.total, note: 'messages', ton: 'neutre' },
              ]}
            />
            <Panneau titre="Boîte de réception">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres}>
                {FILTRES.map((f) => (
                  <Puce key={f.valeur} titre={f.titre} actif={filtre === f.valeur} onPress={() => choisirFiltre(f.valeur)} />
                ))}
              </ScrollView>
              {messages.length === 0 ? (
                <Text style={styles.vide}>Aucun message.</Text>
              ) : (
                messages.map((m) => (
                  <View key={m.idMessage} style={[styles.carte, !m.lu && styles.carteNonLue]}>
                    <View style={styles.haut}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nom}>{m.nom}</Text>
                        <Text style={styles.email}>{m.email}</Text>
                      </View>
                      {!m.lu ? (
                        <View style={styles.nouveau}>
                          <Text style={styles.nouveauTexte}>Nouveau</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.sujet}>{m.sujet}</Text>
                    <Text style={styles.message}>{m.message}</Text>
                    <Text style={styles.date}>{formatDateHeure(m.createdAt)}</Text>
                    <View style={styles.liens}>
                      <Pressable onPress={() => repondre(m)} style={styles.lienLigne}>
                        <Ionicons name="mail-outline" size={16} color={couleurs.primaire} />
                        <Text style={styles.lien}>Répondre par e-mail</Text>
                      </Pressable>
                      {!m.lu ? (
                        <Pressable onPress={() => marquerLu(m)} disabled={occupe === m.idMessage} style={styles.lienLigne}>
                          <Ionicons name="checkmark-done-outline" size={16} color={couleurs.primaire} />
                          <Text style={styles.lien}>Marquer comme lu</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
              {messages.length < donnees.total ? (
                <Bouton
                  titre="Voir plus de messages"
                  variante="contour"
                  chargement={plus}
                  onPress={() => {
                    setPlus(true);
                    charger(page + 1);
                  }}
                />
              ) : null}
            </Panneau>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  filtres: { marginBottom: espaces.m },
  vide: { fontSize: 14, color: couleurs.texteSecondaire },
  carte: { backgroundColor: couleurs.surface2, borderRadius: 16, padding: espaces.m, marginBottom: espaces.s + 2 },
  carteNonLue: { borderLeftWidth: 4, borderLeftColor: couleurs.primaire },
  haut: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  nom: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  email: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 1 },
  nouveau: { backgroundColor: couleurs.primaireClair, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  nouveauTexte: { fontSize: 11, fontWeight: '700', color: couleurs.primaire },
  sujet: { fontSize: 14, fontWeight: '700', color: couleurs.texte, marginTop: espaces.s + 2 },
  message: { fontSize: 14, color: couleurs.texte, marginTop: 4, lineHeight: 20 },
  date: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: espaces.s },
  liens: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m, marginTop: espaces.s + 4 },
  lienLigne: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lien: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});

