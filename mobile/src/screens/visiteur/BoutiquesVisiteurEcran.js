import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import CarteBoutique from '../../components/CarteBoutique';
import Puce from '../../components/Puce';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import { couleurs, degradeHero, espaces, ombre } from '../../theme';

const LIMITE = 10;

export default function BoutiquesVisiteurEcran({ route, navigation }) {
  useThemeVersion();
  const initial = route.params || {};
  const [saisie, setSaisie] = useState(initial.q || '');
  const [terme, setTerme] = useState(initial.q || '');
  const [categorie, setCategorie] = useState(initial.categorie || null);
  const [categories, setCategories] = useState([]);
  const [boutiques, setBoutiques] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [plus, setPlus] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  // La recherche part 0,4 s après la dernière frappe
  useEffect(() => {
    const minuteur = setTimeout(() => setTerme(saisie), 400);
    return () => clearTimeout(minuteur);
  }, [saisie]);

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
        setPlus(false);
      }
    },
    [terme, categorie]
  );

  useEffect(() => {
    setChargement(true);
    charger(1, true);
  }, [charger]);

  const entete = (
    <View>
      <LinearGradient colors={degradeHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.invite}>
        <View style={{ flex: 1 }}>
          <Text style={styles.inviteTitre}>Vous naviguez en visiteur</Text>
          <Text style={styles.inviteTexte}>Connectez-vous pour réserver et payer.</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Connexion')} style={styles.inviteBouton}>
          <Text style={styles.inviteBoutonTexte}>Se connecter</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.recherche}>
        <Ionicons name="search" size={18} color={couleurs.texteSecondaire} />
        <TextInput
          style={styles.champ}
          value={saisie}
          onChangeText={setSaisie}
          placeholder="Rechercher une boutique…"
          placeholderTextColor={couleurs.texteSecondaire}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ idCategorie: null, nom: 'Toutes' }, ...categories]}
        keyExtractor={(c) => String(c.idCategorie)}
        renderItem={({ item }) => (
          <Puce titre={item.nom} actif={categorie === item.idCategorie} onPress={() => setCategorie(item.idCategorie)} />
        )}
        style={styles.categories}
      />
      <Bandeau type="erreur" message={erreur} />
      {!chargement ? <Text style={styles.compte}>{total} boutique{total > 1 ? 's' : ''}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      {chargement && boutiques.length === 0 ? (
        <Chargement />
      ) : (
        <FlatList
          data={boutiques}
          keyExtractor={(b) => String(b.idBoutique)}
          renderItem={({ item }) => (
            <CarteBoutique
              boutique={item}
              onPress={() => navigation.navigate('FicheBoutique', { idBoutique: item.idBoutique, nom: item.nom })}
            />
          )}
          ListHeaderComponent={entete}
          ListEmptyComponent={<EtatVide titre="Aucune boutique trouvée" />}
          ListFooterComponent={
            boutiques.length < total ? (
              <Bouton
                titre="Voir plus de boutiques"
                variante="contour"
                chargement={plus}
                onPress={() => {
                  setPlus(true);
                  charger(page + 1, false);
                }}
              />
            ) : null
          }
          contentContainerStyle={styles.liste}
        />
      )}
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  liste: { padding: espaces.m, paddingBottom: espaces.xl, width: '100%', maxWidth: 700, alignSelf: 'center' },
  invite: { flexDirection: 'row', alignItems: 'center', gap: espaces.m, borderRadius: 20, padding: espaces.m, marginBottom: espaces.m },
  inviteTitre: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  inviteTexte: { fontSize: 12, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
  inviteBouton: { backgroundColor: couleurs.carte, borderRadius: 20, paddingHorizontal: 16, height: 38, alignItems: 'center', justifyContent: 'center' },
  inviteBoutonTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
  recherche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.carte,
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: espaces.m,
    ...ombre,
  },
  champ: { flex: 1, fontSize: 15, color: couleurs.texte, height: 50 },
  categories: { marginBottom: espaces.s },
  compte: { fontSize: 13, color: couleurs.texteSecondaire, marginBottom: espaces.s + 4 },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});