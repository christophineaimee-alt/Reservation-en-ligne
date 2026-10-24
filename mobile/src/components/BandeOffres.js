import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';
import { couleurs, degrade, espaces, rayon, ombre } from '../theme';
import { jourMois, libelleRemise } from '../utils/promotion';

export default function BandeOffres({ navigation, idBoutique }) {
  const [offres, setOffres] = useState([]);

  useEffect(() => {
    let actif = true;
    api
      .get('/promotions', { params: idBoutique ? { idBoutique } : {} })
      .then(({ data }) => {
        if (actif) setOffres(data.promotions);
      })
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, [idBoutique]);

  if (offres.length === 0) return null;

  function ouvrir(o) {
    if (o.idProduitService) {
      navigation.navigate('Article', { idProduitService: o.idProduitService, nom: o.nomElement });
    } else {
      navigation.navigate('Boutique', { idBoutique: o.boutique.idBoutique, nom: o.boutique.nom });
    }
  }

  return (
    <View style={styles.zone}>
      <Text style={styles.titre}>Offres spéciales</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liste}>
        {offres.map((o) => (
          <Pressable key={o.idPromotion} onPress={() => ouvrir(o)} style={({ pressed }) => [styles.carte, pressed && { opacity: 0.9 }]}>
            <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.interieur}>
              <Text style={styles.remise}>{libelleRemise(o)}</Text>
              <Text style={styles.nom} numberOfLines={1}>{o.titre}</Text>
              <Text style={styles.sous} numberOfLines={1}>
                {o.nomElement || 'Toute la boutique'} · {o.boutique.nom}
              </Text>
              <Text style={styles.fin}>Jusqu'au {jourMois(o.dateFin)}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { marginVertical: espaces.s },
  titre: { fontSize: 16, fontWeight: '700', color: couleurs.texte, marginBottom: espaces.s },
  liste: { gap: espaces.s + 4, paddingBottom: 6, paddingRight: espaces.m },
  carte: { width: 230, borderRadius: rayon, backgroundColor: couleurs.carte, ...ombre },
  interieur: { padding: espaces.m, borderRadius: rayon, minHeight: 124, justifyContent: 'space-between' },
  remise: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  nom: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  sous: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  fin: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', marginTop: espaces.s },
});