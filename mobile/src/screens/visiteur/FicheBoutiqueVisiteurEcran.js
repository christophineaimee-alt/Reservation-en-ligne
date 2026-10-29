import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { messageErreur } from '../../api/client';
import Etoiles from '../../components/Etoiles';
import Panneau from '../../components/Panneau';
import ResumeAvis from '../../components/ResumeAvis';
import CarteAvis from '../../components/CarteAvis';
import Bandeau from '../../components/Bandeau';
import Chargement from '../../components/Chargement';
import { couleurs, degradeHero, espaces, rayon } from '../../theme';
import { formatPrix, initiale } from '../../utils/format';
import { jourMois, libelleRemise } from '../../utils/promotion';
import { libelleHoraire, nomJour, trierSemaine } from '../../utils/horaires';

// Fiche complète d'une boutique, visible sans compte
export default function FicheBoutiqueVisiteurEcran({ route, navigation }) {
  useThemeVersion();
  const { idBoutique } = route.params;
  const [fiche, setFiche] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    let actif = true;
    api
      .get(`/visiteur/boutiques/${idBoutique}`)
      .then(({ data }) => {
        if (actif) setFiche(data);
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
  }, [idBoutique]);

  if (chargement) return <Chargement />;
  if (!fiche) {
    return (
      <SafeAreaView style={styles.zone}>
        <View style={styles.contenu}>
          <Bandeau type="erreur" message={erreur || 'Boutique introuvable'} />
        </View>
      </SafeAreaView>
    );
  }

  const b = fiche.boutique;
  const aLogo = b.logo && String(b.logo).startsWith('http');
  const lieu = [b.adresse, b.ville].filter(Boolean).join(', ');
  const aujourdhui = new Date().getDay();
  const semaine = trierSemaine(b.horaires);

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={degradeHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banniere}>
          <View pointerEvents="none" style={styles.cercle} />
          <View style={styles.banniereContenu}>
            {aLogo ? (
              <Image source={{ uri: b.logo }} style={styles.logo} />
            ) : (
              <View style={[styles.logo, styles.logoInitiale]}>
                <Text style={styles.logoLettre}>{initiale(b.nom)}</Text>
              </View>
            )}
            <Text style={styles.nom}>{b.nom}</Text>
            {b.categorie ? (
              <View style={styles.categorie}>
                <Text style={styles.categorieTexte}>{b.categorie.nom}</Text>
              </View>
            ) : null}
            <View style={styles.note}>
              <Etoiles note={b.noteMoyenne} nombre={b.nombreAvis} taille={16} />
            </View>
            {lieu ? (
              <View style={styles.ligneInfo}>
                <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoTexte}>{lieu}</Text>
              </View>
            ) : null}
            {b.telephone ? (
              <Pressable onPress={() => Linking.openURL(`tel:${b.telephone}`)} style={styles.ligneInfo}>
                <Ionicons name="call-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoTexte}>{b.telephone}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => navigation.navigate('Boutique', { idBoutique, nom: b.nom })} style={styles.cta}>
              <Text style={styles.ctaTexte}>Voir le catalogue</Text>
              <Ionicons name="arrow-forward" size={16} color={couleurs.primaire} />
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.contenu}>
          {b.description ? (
            <Panneau titre="À propos" style={styles.espace}>
              <Text style={styles.texte}>{b.description}</Text>
            </Panneau>
          ) : null}

          <Panneau titre="Catalogue" style={styles.espace}>
            <Text style={styles.texte}>
              {fiche.catalogue.nombreArticles} article{fiche.catalogue.nombreArticles > 1 ? 's' : ''} disponible
              {fiche.catalogue.nombreArticles > 1 ? 's' : ''}
              {fiche.catalogue.aPartirDe !== null ? `, à partir de ${formatPrix(fiche.catalogue.aPartirDe)}` : ''}
            </Text>
          </Panneau>

          {fiche.promotions.length > 0 ? (
            <Panneau titre="Offres en cours" style={styles.espace}>
              {fiche.promotions.map((p) => (
                <View key={p.idPromotion} style={styles.offre}>
                  <View style={styles.offrePastille}>
                    <Text style={styles.offreRemise}>{libelleRemise(p)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offreTitre}>{p.titre}</Text>
                    <Text style={styles.offreSous}>
                      {p.nomElement || 'Toute la boutique'} · jusqu'au {jourMois(p.dateFin)}
                    </Text>
                  </View>
                </View>
              ))}
            </Panneau>
          ) : null}

          {semaine.length > 0 ? (
            <Panneau titre="Horaires d'ouverture" style={styles.espace}>
              {semaine.map((h) => (
                <View key={h.jour} style={[styles.horaire, h.jour === aujourdhui && styles.horaireJour]}>
                  <Text style={[styles.jour, h.jour === aujourdhui && styles.horaireJourTexte]}>
                    {nomJour(h.jour)}{h.jour === aujourdhui ? " (aujourd'hui)" : ''}
                  </Text>
                  <Text style={[styles.heures, h.ferme && styles.ferme, h.jour === aujourdhui && styles.horaireJourTexte]}>
                    {libelleHoraire(h)}
                  </Text>
                </View>
              ))}
            </Panneau>
          ) : null}

          <Panneau
            titre="Avis des clients"
            lien={fiche.avis.resume.nombreAvis > 0 ? 'Voir tous' : undefined}
            onLien={() => navigation.navigate('AvisBoutique', { idBoutique, nom: b.nom })}
            style={styles.espace}
          >
            {fiche.avis.resume.nombreAvis === 0 ? (
              <Text style={styles.texte}>Cette boutique n'a pas encore reçu d'avis.</Text>
            ) : (
              <View>
                <ResumeAvis resume={fiche.avis.resume} />
                <View style={styles.avisListe}>
                  {fiche.avis.recents.map((a) => (
                    <CarteAvis key={a.idAvis} avis={a} />
                  ))}
                </View>
              </View>
            )}
          </Panneau>

          <View style={styles.invite}>
            <Text style={styles.inviteTitre}>Envie de réserver ?</Text>
            <Text style={styles.inviteTexte}>Connectez-vous ou créez un compte gratuit pour réserver et payer.</Text>
            <View style={styles.inviteBoutons}>
              <Pressable onPress={() => navigation.navigate('Connexion')} style={styles.inviteBouton}>
                <Text style={styles.inviteBoutonTexte}>Se connecter</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Inscription')} style={styles.inviteContour}>
                <Text style={styles.inviteContourTexte}>Créer un compte</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  banniere: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', paddingBottom: espaces.l },
  cercle: { position: 'absolute', width: 240, height: 240, borderRadius: 120, top: -90, right: -70, backgroundColor: 'rgba(255,255,255,0.09)' },
  banniereContenu: { width: '100%', maxWidth: 900, alignSelf: 'center', alignItems: 'center', paddingHorizontal: espaces.m, paddingTop: espaces.l },
  logo: { width: 84, height: 84, borderRadius: 26, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  logoInitiale: { backgroundColor: couleurs.carte, alignItems: 'center', justifyContent: 'center' },
  logoLettre: { fontSize: 36, fontWeight: '800', color: couleurs.primaire },
  nom: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginTop: espaces.s + 4 },
  categorie: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  categorieTexte: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  note: { backgroundColor: couleurs.carte, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginTop: espaces.s + 4 },
  ligneInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: espaces.s },
  infoTexte: { fontSize: 13, color: 'rgba(255,255,255,0.95)' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.carte,
    borderRadius: 26,
    paddingHorizontal: 22,
    height: 48,
    marginTop: espaces.m,
  },
  ctaTexte: { fontSize: 14, fontWeight: '700', color: couleurs.primaire },
  contenu: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: espaces.m, paddingBottom: espaces.xl },
  espace: { marginTop: espaces.m },
  texte: { fontSize: 14, color: couleurs.texte, lineHeight: 21 },
  offre: { flexDirection: 'row', alignItems: 'center', gap: espaces.s + 4, backgroundColor: couleurs.surface2, borderRadius: 16, padding: espaces.s + 4, marginBottom: espaces.s },
  offrePastille: { backgroundColor: couleurs.erreur, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, minWidth: 64, alignItems: 'center' },
  offreRemise: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  offreTitre: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  offreSous: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
  horaire: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  horaireJour: { backgroundColor: couleurs.primaireClair },
  horaireJourTexte: { color: couleurs.primaire, fontWeight: '700' },
  jour: { fontSize: 14, color: couleurs.texte },
  heures: { fontSize: 14, fontWeight: '600', color: couleurs.texte },
  ferme: { color: couleurs.erreur },
  avisListe: { marginTop: espaces.m },
  invite: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m + 4, marginTop: espaces.l, alignItems: 'center' },
  inviteTitre: { fontSize: 18, fontWeight: '800', color: couleurs.texte },
  inviteTexte: { fontSize: 13, color: couleurs.texteSecondaire, textAlign: 'center', marginTop: 4 },
  inviteBoutons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: espaces.s + 4, marginTop: espaces.m },
  inviteBouton: { backgroundColor: couleurs.primaire, borderRadius: 24, paddingHorizontal: 22, height: 46, alignItems: 'center', justifyContent: 'center' },
  inviteBoutonTexte: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  inviteContour: { borderWidth: 1.5, borderColor: couleurs.primaire, borderRadius: 24, paddingHorizontal: 22, height: 46, alignItems: 'center', justifyContent: 'center' },
  inviteContourTexte: { color: couleurs.primaire, fontWeight: '700', fontSize: 14 },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});