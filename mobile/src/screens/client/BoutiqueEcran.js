import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Panneau from '../../components/Panneau';
import CarteArticle from '../../components/CarteArticle';
import Chargement from '../../components/Chargement';
import EtatVide from '../../components/EtatVide';
import Bandeau from '../../components/Bandeau';
import Badge from '../../components/Badge';
import Puce from '../../components/Puce';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { JOURS, ORDRE_JOURS, initiale } from '../../utils/format';
import LigneNote from '../../components/LigneNote';

function enMinutes(texte) {
  const [h, m] = String(texte).split(':').map(Number);
  return h * 60 + (m || 0);
}

// Pastille « Ouvert » / « Fermé » calculée avec les horaires du jour
function statutOuverture(horaires) {
  const maintenant = new Date();
  const h = (horaires || []).find((x) => x.jour === maintenant.getDay());
  if (!h) return null;
  if (h.ferme) return { libelle: "Fermé aujourd'hui", couleur: couleurs.erreur, fond: couleurs.erreurFond };
  const minutes = maintenant.getHours() * 60 + maintenant.getMinutes();
  if (minutes < enMinutes(h.heureOuverture)) {
    return { libelle: `Ouvre à ${h.heureOuverture}`, couleur: couleurs.attention, fond: '#FFF4DB' };
  }
  if (minutes < enMinutes(h.heureFermeture)) {
    return { libelle: `Ouvert · ferme à ${h.heureFermeture}`, couleur: couleurs.succes, fond: couleurs.succesFond };
  }
  return { libelle: 'Fermé pour aujourd\'hui', couleur: couleurs.erreur, fond: couleurs.erreurFond };
}

// UC05 : consulter le catalogue d'une boutique
export default function BoutiqueEcran({ route, navigation }) {
  const { idBoutique } = route.params;
  const { width } = useWindowDimensions();
  const large = width >= 900;

  const [boutique, setBoutique] = useState(null);
  const [type, setType] = useState(null);
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState('');
  const [chargementBoutique, setChargementBoutique] = useState(true);
  const [chargementCatalogue, setChargementCatalogue] = useState(true);
  const [erreur, setErreur] = useState('');

  // Fiche de la boutique : une seule fois
  useEffect(() => {
    api
      .get(`/boutiques/${idBoutique}`)
      .then(({ data }) => setBoutique(data.boutique))
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargementBoutique(false));
  }, [idBoutique]);

  // Catalogue : à chaque changement de filtre
  useEffect(() => {
    setChargementCatalogue(true);
    api
      .get(`/boutiques/${idBoutique}/catalogue`, { params: type ? { type } : {} })
      .then(({ data }) => {
        setArticles(data.articles);
        setMessage(data.message || '');
      })
      .catch((e) => setErreur(messageErreur(e)))
      .finally(() => setChargementCatalogue(false));
  }, [idBoutique, type]);

  if (chargementBoutique) return <Chargement />;

  if (!boutique) {
    return (
      <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
        <View style={{ padding: espaces.m }}>
          <Bandeau type="erreur" message={erreur || 'Boutique introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  const aLogo = boutique.logo && String(boutique.logo).startsWith('http');
  const lieu = [boutique.adresse, boutique.ville].filter(Boolean).join(', ');
  const ouverture = statutOuverture(boutique.horaires);
  const aujourdhui = new Date().getDay();

  const hero = (
    <View style={styles.heroZone}>
      <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroHaut}>
          {aLogo ? (
            <Image source={{ uri: boutique.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.logoInitiale]}>
              <Text style={styles.lettre}>{initiale(boutique.nom)}</Text>
            </View>
          )}
          {boutique.categorie ? (
            <View style={styles.categorie}>
              <Text style={styles.categorieTexte}>{boutique.categorie.nom}</Text>
            </View>
          ) : null}
          <LigneNote
        noteMoyenne={boutique.noteMoyenne}
        nombreAvis={boutique.nombreAvis}
        onPress={() => navigation.navigate('AvisBoutique', { idBoutique, nom: boutique.nom })}
      />
        </View>
        <Text style={styles.heroNom}>{boutique.nom}</Text>
        {boutique.description ? <Text style={styles.heroDescription}>{boutique.description}</Text> : null}
        <View style={styles.heroInfos}>
          {lieu ? <InfoHero icone="location" texte={lieu} /> : null}
          {boutique.telephone ? <InfoHero icone="call" texte={boutique.telephone} /> : null}
        </View>
      </LinearGradient>
    </View>
  );

  const catalogue = (
    <View>
      <View style={styles.titreSection}>
        <Text style={styles.titre}>Catalogue</Text>
        {!chargementCatalogue ? (
          <Text style={styles.compte}>
            {articles.length} élément{articles.length > 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>
      <View style={styles.puces}>
        <Puce titre="Tout" actif={type === null} onPress={() => setType(null)} />
        <Puce titre="Produits" actif={type === 'PRODUIT'} onPress={() => setType('PRODUIT')} />
        <Puce titre="Services" actif={type === 'SERVICE'} onPress={() => setType('SERVICE')} />
      </View>
      <Bandeau type="erreur" message={erreur} />
      {chargementCatalogue ? (
        <Chargement />
      ) : articles.length === 0 ? (
        <EtatVide titre={message || 'Aucun élément pour le moment'} />
      ) : (
        articles.map((a) => (
          <CarteArticle
            key={a.idProduitService}
            article={a}
            onPress={() => navigation.navigate('Article', { idProduitService: a.idProduitService, nom: a.nom })}
          />
        ))
      )}
    </View>
  );

  const horaires = (
    <Panneau titre="Horaires">
      {ouverture ? (
        <View style={styles.statut}>
          <Badge info={ouverture} />
        </View>
      ) : null}
      {ORDRE_JOURS.map((jour) => {
        const h = (boutique.horaires || []).find((x) => x.jour === jour);
        let texte = 'Non renseigné';
        if (h) texte = h.ferme ? 'Fermé' : `${h.heureOuverture} - ${h.heureFermeture}`;
        const courant = jour === aujourdhui;
        return (
          <View key={jour} style={[styles.ligneHoraire, courant && styles.ligneCourante]}>
            <Text style={[styles.jour, courant && styles.courant]}>{JOURS[jour]}</Text>
            <Text style={[styles.heures, courant && styles.courant]}>{texte}</Text>
          </View>
        );
      })}
    </Panneau>
  );

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.contenu, { maxWidth: large ? 1100 : 600 }]}>
        {hero}
        <View style={[styles.corps, large && styles.enLigne]}>
          <View style={large ? { flex: 2 } : null}>{catalogue}</View>
          <View style={large ? { flex: 1 } : styles.espaceHoraires}>{horaires}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoHero({ icone, texte }) {
  return (
    <View style={styles.infoLigne}>
      <Ionicons name={icone} size={16} color="rgba(255,255,255,0.9)" />
      <Text style={styles.infoTexte}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  heroZone: { backgroundColor: couleurs.carte, borderRadius: rayon, ...ombre },
  hero: { borderRadius: rayon, padding: espaces.l },
  heroHaut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 60, height: 60, borderRadius: 18 },
  logoInitiale: { backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  lettre: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  categorie: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  categorieTexte: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  heroNom: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginTop: espaces.m },
  heroDescription: { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginTop: espaces.xs, lineHeight: 20 },
  heroInfos: { marginTop: espaces.m, gap: 6 },
  infoLigne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTexte: { flexShrink: 1, fontSize: 13, color: 'rgba(255,255,255,0.92)' },
  corps: { marginTop: espaces.m },
  enLigne: { flexDirection: 'row', alignItems: 'flex-start', gap: espaces.m },
  espaceHoraires: { marginTop: espaces.s },
  titreSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaces.s },
  titre: { fontSize: 18, fontWeight: '600', color: couleurs.texte },
  compte: { fontSize: 14, fontWeight: '500', color: couleurs.primaire },
  puces: { flexDirection: 'row', marginBottom: espaces.m },
  statut: { marginBottom: espaces.s },
  ligneHoraire: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  ligneCourante: { backgroundColor: couleurs.primaireClair },
  jour: { fontSize: 14, color: couleurs.texteSecondaire },
  heures: { fontSize: 14, color: couleurs.texteSecondaire },
  courant: { color: couleurs.primaire, fontWeight: '700' },
});