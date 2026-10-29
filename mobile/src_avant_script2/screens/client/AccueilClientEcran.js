import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api, { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import EnTetePage from '../../components/EnTetePage';
import ChampRecherche from '../../components/ChampRecherche';
import CarteBoutique from '../../components/CarteBoutique';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, espaces } from '../../theme';
import BandeOffres from '../../components/BandeOffres';

const LIMITE = 10;

// UC03 : rechercher une boutique / UC04 : rechercher par catégorie
export default function AccueilClientEcran({ navigation }) {
  const { utilisateur } = useAuth();
  const { width } = useWindowDimensions();
  const large = width >= 900;

  const [categories, setCategories] = useState([]);
  const [categorie, setCategorie] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [terme, setTerme] = useState('');
  const [boutiques, setBoutiques] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [nonLues, setNonLues] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  // Les catégories se chargent une seule fois
  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  // Pastille rouge de la cloche : notifications non lues
  useFocusEffect(
    useCallback(() => {
      api
        .get('/notifications', { params: { limite: 1 } })
        .then(({ data }) => setNonLues(data.nonLues))
        .catch(() => {});
    }, [])
  );

  // On attend 0,4 s après la dernière frappe avant de lancer la recherche
  useEffect(() => {
    const minuteur = setTimeout(() => setTerme(recherche), 400);
    return () => clearTimeout(minuteur);
  }, [recherche]);

  const charger = useCallback(
    async (numeroPage, remplacer) => {
      try {
        setErreur('');
        const params = { page: numeroPage, limite: LIMITE };
        if (terme.trim()) params.q = terme.trim();
        if (categorie) params.categorie = categorie;
        const { data } = await api.get('/boutiques', { params });
        setTotal(data.total);
        setPage(numeroPage);
        setBoutiques((anciennes) => (remplacer ? data.boutiques : [...anciennes, ...data.boutiques]));
      } catch (e) {
        setErreur(messageErreur(e));
      } finally {
        setChargement(false);
        setRafraichit(false);
        setPlus(false);
      }
    },
    [terme, categorie]
  );

  // Nouvelle recherche ou nouvelle catégorie : on repart de la page 1
  useEffect(() => {
    setChargement(true);
    charger(1, true);
  }, [charger]);

  function chargerPlus() {
    if (plus || chargement || boutiques.length >= total) return;
    setPlus(true);
    charger(page + 1, false);
  }

  function rafraichir() {
    setRafraichit(true);
    charger(1, true);
  }

  const entete = (
    <View>
      <EnTetePage
        titre={`Bonjour, ${utilisateur.prenom}`}
        sousTitre="Trouvez un commerce et réservez en quelques secondes"
        nonLues={nonLues}
        onNotifications={() => navigation.navigate('Notifications')}
      />

      <ChampRecherche
        valeur={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher une boutique, une adresse..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.defilement}
        contentContainerStyle={styles.puces}
      >
        <Puce titre="Toutes" actif={categorie === null} onPress={() => setCategorie(null)} />
        {categories.map((c) => (
          <Puce
            key={c.idCategorie}
            titre={c.nom}
            actif={categorie === c.idCategorie}
            onPress={() => setCategorie(c.idCategorie)}
          />
        ))}
      </ScrollView>
      <BandeOffres navigation={navigation} />

      <Bandeau type="erreur" message={erreur} />

      <View style={styles.titreSection}>
        <Text style={styles.titre}>Boutiques</Text>
        {!chargement ? (
          <Text style={styles.compte}>
            {total} résultat{total > 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.zone}>
      <FlatList
        key={large ? 'grille' : 'liste'}
        numColumns={large ? 2 : 1}
        columnWrapperStyle={large ? styles.colonnes : undefined}
        data={chargement ? [] : boutiques}
        keyExtractor={(b) => String(b.idBoutique)}
        renderItem={({ item }) => (
          <View style={large ? styles.cellule : null}>
            <CarteBoutique
              boutique={item}
              onPress={() => navigation.navigate('Boutique', { idBoutique: item.idBoutique, nom: item.nom })}
            />
          </View>
        )}
        ListHeaderComponent={entete}
        ListEmptyComponent={
          chargement ? (
            <Chargement />
          ) : erreur ? null : (
            <EtatVide titre="Aucune boutique trouvée" message="Modifiez votre recherche ou la catégorie." />
          )
        }
        ListFooterComponent={plus ? <Chargement /> : null}
        contentContainerStyle={[styles.liste, { maxWidth: large ? 1100 : 600 }]}
        onEndReached={chargerPlus}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={rafraichit} onRefresh={rafraichir} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  liste: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  defilement: { marginHorizontal: -espaces.m, marginTop: espaces.m },
  puces: { paddingHorizontal: espaces.m, paddingVertical: 6 },
  titreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: espaces.m,
    marginBottom: espaces.m,
  },
  titre: { fontSize: 18, fontWeight: '600', color: couleurs.texte },
  compte: { fontSize: 14, fontWeight: '500', color: couleurs.primaire },
  colonnes: { gap: espaces.m },
  cellule: { flex: 1, maxWidth: '50%' },
});