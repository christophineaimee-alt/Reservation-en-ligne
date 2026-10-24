import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import EnTetePage from '../../components/EnTetePage';
import BandeauChiffres from '../../components/BandeauChiffres';
import Panneau from '../../components/Panneau';
import ResumeAvis from '../../components/ResumeAvis';
import CarteAvis from '../../components/CarteAvis';
import Puce from '../../components/Puce';
import Bouton from '../../components/Bouton';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, espaces } from '../../theme';

// Avis des clients et réponses du commerçant
export default function AvisCommercantEcran({ navigation }) {
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [filtre, setFiltre] = useState('');
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [enReponse, setEnReponse] = useState(null);
  const [texte, setTexte] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/commercant/avis', {
        params: { sansReponse: filtre === 'sans' ? 'true' : undefined, limite: 30 },
      });
      setDonnees(data);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, [filtre]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger])
  );

  function choisirFiltre(valeur) {
    setChargement(true);
    setFiltre(valeur);
  }

  async function publier(idAvis) {
    setEnvoi(true);
    setErreur('');
    setSucces('');
    try {
      const { data } = await api.patch(`/commercant/avis/${idAvis}/reponse`, { reponse: texte });
      setSucces(data.message);
      setEnReponse(null);
      setTexte('');
      await charger();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  const resume = donnees ? donnees.resume : null;

  return (
    <SafeAreaView style={styles.zone}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { maxWidth: large ? 1100 : 600 }]}
        keyboardShouldPersistTaps="handled"
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
          titre="Avis clients"
          sousTitre="Ce que vos clients pensent de votre boutique"
          onNotifications={() => navigation.navigate('Notifications')}
        />
        <Bandeau type="succes" message={succes} />
        <Bandeau type="erreur" message={erreur} />

        {chargement && !donnees ? (
          <Chargement />
        ) : donnees ? (
          <View>
            <BandeauChiffres
              items={[
                {
                  titre: 'Note moyenne',
                  valeur: resume.nombreAvis > 0 ? String(resume.noteMoyenne).replace('.', ',') : '—',
                  note: 'sur 5',
                  ton: resume.nombreAvis === 0 ? 'neutre' : resume.noteMoyenne >= 4 ? 'hausse' : resume.noteMoyenne < 3 ? 'baisse' : 'neutre',
                },
                { titre: 'Avis reçus', valeur: resume.nombreAvis, note: 'clients', ton: 'neutre' },
                {
                  titre: 'À répondre',
                  valeur: donnees.sansReponse,
                  note: donnees.sansReponse > 0 ? 'en attente' : 'à jour',
                  ton: donnees.sansReponse > 0 ? 'baisse' : 'hausse',
                },
              ]}
            />

            <View style={[styles.deuxColonnes, large && styles.enLigne]}>
              <Panneau titre="Répartition des notes" style={large ? { flex: 1 } : null}>
                <ResumeAvis resume={resume} />
              </Panneau>

              <Panneau titre="Avis" style={large ? { flex: 2 } : null}>
                <View style={styles.filtres}>
                  <Puce titre="Tous" actif={filtre === ''} onPress={() => choisirFiltre('')} />
                  <Puce titre="À répondre" actif={filtre === 'sans'} onPress={() => choisirFiltre('sans')} />
                </View>
                {donnees.avis.length === 0 ? (
                  <Text style={styles.vide}>
                    {filtre === 'sans' ? 'Tous les avis ont reçu une réponse.' : 'Aucun avis pour le moment.'}
                  </Text>
                ) : (
                  donnees.avis.map((a) => (
                    <CarteAvis key={a.idAvis} avis={a}>
                      {enReponse === a.idAvis ? (
                        <View style={styles.zoneReponse}>
                          <TextInput
                            style={styles.champ}
                            multiline
                            maxLength={500}
                            value={texte}
                            onChangeText={setTexte}
                            placeholder="Votre réponse publique…"
                            placeholderTextColor={couleurs.texteSecondaire}
                          />
                          <View style={styles.actions}>
                            <Bouton
                              titre="Annuler"
                              variante="contour"
                              onPress={() => setEnReponse(null)}
                              style={styles.moitie}
                            />
                            <Bouton
                              titre="Publier"
                              onPress={() => publier(a.idAvis)}
                              chargement={envoi}
                              desactive={texte.trim().length === 0}
                              style={styles.moitie}
                            />
                          </View>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => {
                            setEnReponse(a.idAvis);
                            setTexte(a.reponse || '');
                            setSucces('');
                          }}
                          style={styles.repondre}
                        >
                          <Ionicons name="chatbubble-outline" size={16} color={couleurs.primaire} />
                          <Text style={styles.repondreTexte}>{a.reponse ? 'Modifier la réponse' : 'Répondre'}</Text>
                        </Pressable>
                      )}
                    </CarteAvis>
                  ))
                )}
              </Panneau>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { width: '100%', alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  deuxColonnes: { gap: espaces.m },
  enLigne: { flexDirection: 'row', alignItems: 'flex-start' },
  filtres: { flexDirection: 'row', marginBottom: espaces.m },
  vide: { fontSize: 14, color: couleurs.texteSecondaire },
  repondre: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: espaces.s + 4, alignSelf: 'flex-start' },
  repondreTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
  zoneReponse: { marginTop: espaces.s + 4 },
  champ: {
    minHeight: 80,
    backgroundColor: couleurs.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: couleurs.texte,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: espaces.s, marginTop: espaces.s },
  moitie: { flex: 1 },
});