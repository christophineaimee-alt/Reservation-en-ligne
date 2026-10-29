import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import api, { messageErreur } from '../../api/client';
import EnTetePage from '../../components/EnTetePage';
import BandeauChiffres from '../../components/BandeauChiffres';
import Panneau from '../../components/Panneau';
import Puce from '../../components/Puce';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, degrade, espaces } from '../../theme';
import { ETATS_PROMOTION, dateCourte, libelleRemise } from '../../utils/promotion';

const FILTRES = [
  { titre: 'Toutes', valeur: '' },
  { titre: 'En cours', valeur: 'EN_COURS' },
  { titre: 'À venir', valeur: 'A_VENIR' },
  { titre: 'Inactives', valeur: 'INACTIVE' },
];

// Promotions et offres spéciales du commerçant
export default function PromotionsEcran({ navigation }) {
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [promotions, setPromotions] = useState([]);
  const [filtre, setFiltre] = useState('');
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [aSupprimer, setASupprimer] = useState(null);
  const [occupe, setOccupe] = useState(null);

  const charger = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/commercant/promotions');
      setPromotions(data.promotions);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  async function basculer(p) {
    setOccupe(p.idPromotion);
    setErreur('');
    setSucces('');
    try {
      const { data } = await api.patch(`/commercant/promotions/${p.idPromotion}/activation`, { actif: !p.actif });
      setSucces(data.message);
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setOccupe(null);
    }
  }

  async function supprimer(p) {
    setOccupe(p.idPromotion);
    setErreur('');
    setSucces('');
    try {
      const { data } = await api.delete(`/commercant/promotions/${p.idPromotion}`);
      setSucces(data.message);
      setASupprimer(null);
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
      setASupprimer(null);
    } finally {
      setOccupe(null);
    }
  }

  const nombre = (etat) => promotions.filter((p) => p.etat === etat).length;
  const visibles = promotions.filter((p) => {
    if (filtre === '') return true;
    if (filtre === 'INACTIVE') return p.etat === 'TERMINEE' || p.etat === 'DESACTIVEE';
    return p.etat === filtre;
  });

  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: large ? 1100 : 600 }]}
        refreshControl={
          <RefreshControl
            refreshing={rafraichit}
            onRefresh={() => {
              setRafraichit(true);
              charger();
            }}
          />
        }
      >
        <EnTetePage
          titre="Promotions"
          sousTitre="Offres spéciales et remises de votre boutique"
          onNotifications={() => navigation.navigate('Notifications')}
        />
        <Bandeau type="succes" message={succes} />
        <Bandeau type="erreur" message={erreur} />

        {chargement ? (
          <Chargement />
        ) : (
          <View>
            <BandeauChiffres
              items={[
                { titre: 'En cours', valeur: nombre('EN_COURS'), note: 'promotions', ton: nombre('EN_COURS') > 0 ? 'hausse' : 'neutre' },
                { titre: 'À venir', valeur: nombre('A_VENIR'), note: 'programmées', ton: 'neutre' },
                { titre: 'Inactives', valeur: nombre('TERMINEE') + nombre('DESACTIVEE'), note: 'terminées', ton: 'neutre' },
              ]}
            />

            <Bouton titre="Nouvelle promotion" onPress={() => navigation.navigate('PromotionForm')} style={styles.nouvelle} />

            <Panneau titre="Mes promotions">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres}>
                {FILTRES.map((f) => (
                  <Puce key={f.valeur} titre={f.titre} actif={filtre === f.valeur} onPress={() => setFiltre(f.valeur)} />
                ))}
              </ScrollView>

              {visibles.length === 0 ? (
                <Text style={styles.vide}>
                  {promotions.length === 0 ? 'Aucune promotion pour le moment.' : 'Aucune promotion dans cette catégorie.'}
                </Text>
              ) : (
                visibles.map((p) => {
                  const etat = ETATS_PROMOTION[p.etat];
                  const inactive = p.etat === 'TERMINEE' || p.etat === 'DESACTIVEE';
                  return (
                    <View key={p.idPromotion} style={[styles.carte, inactive && { opacity: 0.7 }]}>
                      <View style={styles.haut}>
                        <LinearGradient colors={degrade} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.remise}>
                          <Text style={styles.remiseTexte} numberOfLines={2}>{libelleRemise(p)}</Text>
                        </LinearGradient>
                        <View style={styles.textes}>
                          <Text style={styles.titre} numberOfLines={1}>{p.titre}</Text>
                          <Text style={styles.sous} numberOfLines={1}>{p.nomElement || 'Toute la boutique'}</Text>
                          <Text style={styles.sous}>Du {dateCourte(p.dateDebut)} au {dateCourte(p.dateFin)}</Text>
                        </View>
                        <View style={[styles.etat, { backgroundColor: etat.fond }]}>
                          <Text style={[styles.etatTexte, { color: etat.couleur }]}>{etat.texte}</Text>
                        </View>
                      </View>

                      {aSupprimer === p.idPromotion ? (
                        <View style={styles.confirmation}>
                          <Text style={styles.confirmationTexte}>Supprimer cette promotion ?</Text>
                          <View style={styles.actions}>
                            <Bouton titre="Non" variante="contour" onPress={() => setASupprimer(null)} style={styles.moitie} />
                            <Bouton titre="Oui, supprimer" onPress={() => supprimer(p)} chargement={occupe === p.idPromotion} style={styles.moitie} />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.liens}>
                          <Pressable onPress={() => navigation.navigate('PromotionForm', { promotion: p })}>
                            <Text style={styles.lien}>Modifier</Text>
                          </Pressable>
                          <Pressable onPress={() => basculer(p)} disabled={occupe === p.idPromotion}>
                            <Text style={styles.lien}>{p.actif ? 'Désactiver' : 'Activer'}</Text>
                          </Pressable>
                          <Pressable onPress={() => setASupprimer(p.idPromotion)}>
                            <Text style={[styles.lien, { color: couleurs.erreur }]}>Supprimer</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </Panneau>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  nouvelle: { marginBottom: espaces.m },
  filtres: { marginBottom: espaces.m },
  vide: { fontSize: 14, color: couleurs.texteSecondaire },
  carte: { backgroundColor: couleurs.surface2, borderRadius: 16, padding: espaces.m, marginBottom: espaces.s + 2 },
  haut: { flexDirection: 'row', alignItems: 'center', gap: espaces.s + 4 },
  remise: { width: 68, height: 68, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 4 },
  remiseTexte: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  textes: { flex: 1 },
  titre: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  sous: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
  etat: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  etatTexte: { fontSize: 11, fontWeight: '700' },
  liens: { flexDirection: 'row', gap: espaces.l, marginTop: espaces.s + 4 },
  lien: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
  confirmation: { marginTop: espaces.s + 4 },
  confirmationTexte: { fontSize: 14, color: couleurs.texte, marginBottom: espaces.s },
  actions: { flexDirection: 'row', gap: espaces.s },
  moitie: { flex: 1 },
});