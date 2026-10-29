import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { formatPrix, libelleType } from '../../utils/format';
import PrixPromo from '../../components/PrixPromo';

// UC05 : détail d'un produit ou d'un service
export default function ArticleEcran({ route, navigation }) {
  const { idProduitService } = route.params;
  const { width } = useWindowDimensions();
  const large = width >= 900;

  const [article, setArticle] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get(`/produits-services/${idProduitService}`)
      .then(({ data }) => setArticle(data.article))
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargement(false));
  }, [idProduitService]);

  if (chargement) return <Chargement />;

  if (!article) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <View style={{ padding: espaces.m }}>
          <Bandeau type="erreur" message={erreur || 'Élément introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  const service = article.type === 'SERVICE';
  const aPhoto = article.photo && String(article.photo).startsWith('http');
  const icone = service ? 'sparkles' : 'cube';
  const epuise = !service && !article.disponible;

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: large ? 760 : 600 }]}>
        {aPhoto ? (
          <Image source={{ uri: article.photo }} style={styles.photo} />
        ) : (
          <View style={styles.heroZone}>
            <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={styles.heroPastille}>
                <Ionicons name={icone} size={34} color="#FFFFFF" />
              </View>
              <Text style={styles.heroType}>{libelleType(article.type)}</Text>
            </LinearGradient>
          </View>
        )}

        <Panneau style={styles.espace}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeTexte}>{libelleType(article.type)}</Text>
          </View>
          <Text style={styles.nom}>{article.nom}</Text>
          {article.boutique ? (
            <View style={styles.ligneBoutique}>
              <Ionicons name="storefront" size={15} color={couleurs.primaire} />
              <Text style={styles.boutique}>
                {article.boutique.nom}
                {article.boutique.ville ? ` · ${article.boutique.ville}` : ''}
              </Text>
            </View>
          ) : null}
          <PrixPromo prix={article.prix} promotion={article.promotion} style={styles.prix} fin />
          {article.description ? <Text style={styles.description}>{article.description}</Text> : null}
        </Panneau>

        <Panneau titre="Détails" style={styles.espace}>
          {service ? (
            <Ligne
              icone="time"
              titre="Durée"
              valeur={article.dureeMinutes ? `${article.dureeMinutes} minutes` : 'Non précisée'}
            />
          ) : (
            <Ligne
              icone="cube"
              titre="Disponibilité"
              valeur={article.disponible ? `En stock (${article.quantiteDisponible})` : 'Épuisé'}
              rouge={!article.disponible}
            />
          )}
          {article.boutique ? <Ligne icone="storefront" titre="Boutique" valeur={article.boutique.nom} /> : null}
          {article.boutique && article.boutique.ville ? (
            <Ligne icone="location" titre="Ville" valeur={article.boutique.ville} />
          ) : null}
          <Ligne icone="pricetag" titre="Type" valeur={libelleType(article.type)} />
        </Panneau>

        <View style={styles.espace}>
          <Bouton
            titre={epuise ? 'Indisponible' : 'Réserver'}
            desactive={epuise}
            onPress={() => navigation.navigate('NouvelleReservation', { idProduitService: article.idProduitService })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Ligne({ icone, titre, valeur, rouge }) {
  return (
    <View style={styles.ligne}>
      <View style={styles.pastille}>
        <Ionicons name={icone} size={17} color={couleurs.primaire} />
      </View>
      <View style={styles.textes}>
        <Text style={styles.ligneTitre}>{titre}</Text>
        <Text style={[styles.ligneValeur, rouge && { color: couleurs.erreur }]}>{valeur}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  photo: { width: '100%', height: 220, borderRadius: rayon },
  heroZone: { backgroundColor: couleurs.carte, borderRadius: rayon, ...ombre },
  hero: { borderRadius: rayon, paddingVertical: espaces.xl, alignItems: 'center' },
  heroPastille: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroType: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', marginTop: espaces.s },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.primaireClair,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  typeTexte: { fontSize: 12, fontWeight: '700', color: couleurs.primaire },
  nom: { fontSize: 26, fontWeight: '600', color: couleurs.texte, marginTop: espaces.s },
  ligneBoutique: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: espaces.xs },
  boutique: { fontSize: 14, color: couleurs.texteSecondaire },
  prix: { fontSize: 28, fontWeight: '700', color: couleurs.primaire, marginTop: espaces.m },
  description: { fontSize: 15, color: couleurs.texte, lineHeight: 22, marginTop: espaces.s },
  ligne: { flexDirection: 'row', alignItems: 'center', paddingVertical: espaces.s },
  pastille: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: couleurs.primaireClair,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: espaces.m,
  },
  textes: { flex: 1 },
  ligneTitre: { fontSize: 12, color: couleurs.texteSecondaire },
  ligneValeur: { fontSize: 15, fontWeight: '600', color: couleurs.texte, marginTop: 1 },
});