import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api, { messageErreur } from '../../api/client';
import Ecran from '../../components/Ecran';
import ChampTexte from '../../components/ChampTexte';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Puce from '../../components/Puce';
import { couleurs, degrade, espaces, rayon, ombre } from '../../theme';
import { libelleRemise } from '../../utils/promotion';

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

function versYMD(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function ajouterJours(ymd, n) {
  const d = FORMAT_DATE.test(ymd) ? new Date(`${ymd}T12:00:00`) : new Date();
  d.setDate(d.getDate() + n);
  return versYMD(d);
}

// Créer une promotion, ou la modifier si "promotion" est fournie
export default function PromotionFormEcran({ route, navigation }) {
  const promotion = route.params ? route.params.promotion : null;
  const [titre, setTitre] = useState(promotion ? promotion.titre : '');
  const [description, setDescription] = useState(promotion && promotion.description ? promotion.description : '');
  const [typeRemise, setTypeRemise] = useState(promotion ? promotion.typeRemise : 'POURCENTAGE');
  const [valeur, setValeur] = useState(promotion ? String(promotion.valeur) : '');
  const [dateDebut, setDateDebut] = useState(promotion ? versYMD(new Date(promotion.dateDebut)) : versYMD(new Date()));
  const [dateFin, setDateFin] = useState(
    promotion ? versYMD(new Date(promotion.dateFin)) : ajouterJours(versYMD(new Date()), 7)
  );
  const [idProduitService, setIdProduitService] = useState(promotion ? promotion.idProduitService : null);
  const [articles, setArticles] = useState([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api
      .get('/commercant/produits-services')
      .then(({ data }) => setArticles(data.articles.filter((a) => a.actif !== false)))
      .catch(() => {});
  }, []);

  const valeurNombre = Number(String(valeur).replace(',', '.'));

  function verifier() {
    if (titre.trim().length < 3) return 'Le titre doit contenir au moins 3 caractères';
    if (!valeurNombre || valeurNombre <= 0) return 'Indiquez une remise supérieure à 0';
    if (typeRemise === 'POURCENTAGE' && valeurNombre > 90) return 'Le pourcentage ne peut pas dépasser 90';
    if (!FORMAT_DATE.test(dateDebut) || !FORMAT_DATE.test(dateFin)) return 'Dates au format AAAA-MM-JJ (par exemple 2026-10-30)';
    if (dateFin < dateDebut) return 'La date de fin doit être après la date de début';
    return '';
  }

  async function enregistrer() {
    const probleme = verifier();
    if (probleme) {
      setErreur(probleme);
      return;
    }
    setEnvoi(true);
    setErreur('');
    try {
      const corps = {
        titre: titre.trim(),
        description: description.trim() || undefined,
        typeRemise,
        valeur: valeurNombre,
        dateDebut,
        dateFin,
        idProduitService,
      };
      if (promotion) {
        await api.put(`/commercant/promotions/${promotion.idPromotion}`, corps);
      } else {
        await api.post('/commercant/promotions', corps);
      }
      navigation.goBack();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Ecran centre={false}>
      {valeurNombre > 0 ? (
        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.apercu}>
          <Text style={styles.apercuRemise}>{libelleRemise({ typeRemise, valeur: valeurNombre })}</Text>
          <Text style={styles.apercuTitre} numberOfLines={1}>{titre.trim() || 'Votre promotion'}</Text>
        </LinearGradient>
      ) : null}

      <ChampTexte label="Titre de la promotion" placeholder="Soldes de rentrée" value={titre} onChangeText={setTitre} autoCapitalize="sentences" />
      <ChampTexte
        label="Description (facultatif)"
        placeholder="Conditions, détails…"
        value={description}
        onChangeText={setDescription}
        autoCapitalize="sentences"
        multiline
      />

      <Text style={styles.section}>Type de remise</Text>
      <View style={styles.types}>
        {[
          { code: 'POURCENTAGE', titre: 'Pourcentage', sous: 'par exemple -20 %' },
          { code: 'MONTANT', titre: 'Montant fixe', sous: 'par exemple -2 000 Ar' },
        ].map((t) => (
          <Pressable
            key={t.code}
            onPress={() => setTypeRemise(t.code)}
            style={[styles.type, typeRemise === t.code && styles.typeActif]}
          >
            <Text style={[styles.typeTitre, typeRemise === t.code && { color: couleurs.primaire }]}>{t.titre}</Text>
            <Text style={styles.typeSous}>{t.sous}</Text>
          </Pressable>
        ))}
      </View>
      <ChampTexte
        label={typeRemise === 'POURCENTAGE' ? 'Pourcentage de remise (1 à 90)' : 'Montant de la remise (Ar)'}
        placeholder={typeRemise === 'POURCENTAGE' ? '20' : '2000'}
        keyboardType="numeric"
        value={valeur}
        onChangeText={setValeur}
      />

      <ChampTexte label="Date de début (AAAA-MM-JJ)" placeholder="2026-10-30" value={dateDebut} onChangeText={setDateDebut} />
      <ChampTexte label="Date de fin (AAAA-MM-JJ)" placeholder="2026-11-06" value={dateFin} onChangeText={setDateFin} />
      <View style={styles.rapides}>
        {[7, 30, 90].map((n) => (
          <Puce key={n} titre={`${n} jours`} actif={false} onPress={() => setDateFin(ajouterJours(dateDebut, n))} />
        ))}
      </View>

      <Text style={styles.section}>Appliquer à</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.articles}>
        <Puce titre="Toute la boutique" actif={idProduitService === null} onPress={() => setIdProduitService(null)} />
        {articles.map((a) => (
          <Puce
            key={a.idProduitService}
            titre={a.nom}
            actif={idProduitService === a.idProduitService}
            onPress={() => setIdProduitService(a.idProduitService)}
          />
        ))}
      </ScrollView>

      <Bandeau type="erreur" message={erreur} />
      <Bouton titre={promotion ? 'Enregistrer les modifications' : 'Créer la promotion'} onPress={enregistrer} chargement={envoi} />
      <Bouton titre="Annuler" variante="texte" onPress={() => navigation.goBack()} style={{ marginTop: espaces.s }} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  apercu: { borderRadius: rayon, padding: espaces.l, alignItems: 'center', marginBottom: espaces.m, ...ombre },
  apercuRemise: { fontSize: 34, fontWeight: '800', color: '#FFFFFF' },
  apercuTitre: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  section: { fontSize: 14, fontWeight: '600', color: couleurs.texte, marginBottom: espaces.s },
  types: { flexDirection: 'row', gap: espaces.s, marginBottom: espaces.m },
  type: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: espaces.m,
    ...ombre,
  },
  typeActif: { borderColor: couleurs.primaire, backgroundColor: couleurs.primaireClair },
  typeTitre: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  typeSous: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 2 },
  rapides: { flexDirection: 'row', marginTop: -espaces.s, marginBottom: espaces.m },
  articles: { marginBottom: espaces.m },
});