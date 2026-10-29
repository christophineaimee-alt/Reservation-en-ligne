import { enregistrerStyles, useThemeVersion } from '../../theme/registre';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import CarteBoutique from '../../components/CarteBoutique';
import Etoiles from '../../components/Etoiles';
import { couleurs, degradeHero, espaces, rayon, ombre } from '../../theme';
import { jourMois, libelleRemise } from '../../utils/promotion';
import BoutonTheme from '../../components/BoutonTheme';

// Les trois couleurs du style : indigo, orange et turquoise
const ACCENT = couleurs.accent || '#F0763A';
const ACCENT_FOND = couleurs.accentFond || '#FDEBE2';
const TURQ = couleurs.turquoise || '#2BA9B0';
const TURQ_FOND = couleurs.turquoiseFond || '#DDF4F5';
const creerTEINTES = () => [
  { couleur: couleurs.primaire, fond: couleurs.primaireClair },
  { couleur: ACCENT, fond: ACCENT_FOND },
  { couleur: TURQ, fond: TURQ_FOND },
];
const TEINTES = creerTEINTES();
enregistrerStyles(() => {
  TEINTES.splice(0, TEINTES.length, ...creerTEINTES());
});
const teinte = (i) => TEINTES[i % TEINTES.length];
const DEGRADES_OFFRES = [
  ['#6C61C9', '#4D4398'],
  ['#F59A66', '#F0763A'],
  ['#3CC0C7', '#2BA9B0'],
];

const ATOUTS = [
  { icone: 'calendar-outline', titre: 'Réservation en ligne', texte: 'Produits et services, avec des créneaux à jour, 24 h sur 24.' },
  { icone: 'phone-portrait-outline', titre: 'Paiement mobile', texte: 'Réglez avec MVola, Orange Money ou Airtel Money.' },
  { icone: 'pricetag-outline', titre: 'Offres et promotions', texte: 'Profitez des remises proposées par les commerçants.' },
  { icone: 'star-outline', titre: 'Avis et notes', texte: 'Choisissez grâce aux retours de vrais clients.' },
  { icone: 'notifications-outline', titre: 'Suivi en temps réel', texte: 'Soyez prévenu dès que votre réservation est acceptée.' },
  { icone: 'shield-checkmark-outline', titre: 'Boutiques validées', texte: 'Chaque commerce est vérifié avant d\'apparaître.' },
];

const ETAPES = [
  { icone: 'search-outline', titre: 'Trouvez', texte: 'Cherchez une boutique par nom ou par catégorie.' },
  { icone: 'calendar-outline', titre: 'Réservez', texte: 'Choisissez un article ou un créneau et envoyez votre demande.' },
  { icone: 'wallet-outline', titre: 'Payez et profitez', texte: 'Payez après acceptation, puis donnez votre avis.' },
];

const AVANTAGES_COMMERCANT = [
  'Gestion simple des réservations et des stocks',
  'Paiements mobiles et suivi des encaissements',
  'Promotions et offres spéciales en quelques clics',
  'Avis clients et tableau de bord en temps réel',
];

function MiniPastille({ texte, couleur, fond }) {
  return (
    <View style={[styles.miniPastille, { backgroundColor: fond }]}>
      <View style={[styles.miniPoint, { backgroundColor: couleur }]} />
      <Text style={[styles.miniPastilleTexte, { color: couleur }]}>{texte}</Text>
    </View>
  );
}

// En-tête de section : petite étiquette, titre, texte
function EnteteSection({ etiquette, titre, texte, centre = true }) {
  return (
    <View style={[styles.enteteSection, centre && { alignItems: 'center' }]}>
      {etiquette ? <Text style={styles.etiquetteSection}>{etiquette.toUpperCase()}</Text> : null}
      <Text style={[styles.titreSection, centre && { textAlign: 'center' }]}>{titre}</Text>
      {texte ? <Text style={[styles.texteSection, centre && { textAlign: 'center' }]}>{texte}</Text> : null}
    </View>
  );
}

// Aperçu de l'application : cartes flottantes
function ApercuApp({ large }) {
  const cartes = [
    <View key="r" style={styles.carteApercu}>
      <View style={styles.apercuLigne}>
        <View style={[styles.apercuIcone, { backgroundColor: couleurs.primaireClair }]}>
          <Ionicons name="calendar" size={20} color={couleurs.primaire} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.apercuTitre}>Coupe & brushing</Text>
          <Text style={styles.apercuSous}>Votre boutique · Aujourd'hui, 14:30</Text>
        </View>
      </View>
      <MiniPastille texte="Acceptée" couleur={couleurs.succes} fond={couleurs.succesFond} />
    </View>,
    <View key="p" style={styles.carteApercu}>
      <View style={styles.apercuLigne}>
        <View style={[styles.apercuIcone, { backgroundColor: TURQ_FOND }]}>
          <Ionicons name="wallet" size={20} color={TURQ} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.apercuTitre}>Paiement confirmé</Text>
          <Text style={styles.apercuSous}>MVola · 15 000 Ar</Text>
        </View>
      </View>
      <MiniPastille texte="Payé" couleur={couleurs.succes} fond={couleurs.succesFond} />
    </View>,
    <View key="a" style={styles.carteApercu}>
      <Etoiles note={5} taille={16} />
      <Text style={[styles.apercuTitre, { marginTop: 8 }]}>« Accueil au top, je recommande ! »</Text>
      <Text style={styles.apercuSous}>Avis d'un client · exemple</Text>
    </View>,
  ];

  if (!large) {
    return (
      <View style={{ gap: espaces.s + 4 }}>
        {cartes.map((c, i) => (
          <View key={i} style={{ alignSelf: i === 1 ? 'flex-end' : 'flex-start', width: '92%' }}>{c}</View>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.apercuZone}>
      <View style={[styles.apercuPosition, { top: 0, left: 10 }]}>{cartes[0]}</View>
      <View style={[styles.apercuPosition, { top: 120, right: 0 }]}>{cartes[1]}</View>
      <View style={[styles.apercuPosition, { top: 245, left: 30 }]}>{cartes[2]}</View>
      <View style={styles.bulleOffre}>
        <Text style={styles.bulleOffreTexte}>-20 %</Text>
      </View>
    </View>
  );
}

// Interface visiteur : présentation de la plateforme, sans compte
export default function AccueilVisiteurEcran({ navigation }) {
  useThemeVersion();
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [terme, setTerme] = useState('');
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState(false);

  function charger() {
    setErreur(false);
    api
      .get('/visiteur/accueil')
      .then(({ data }) => setDonnees(data))
      .catch(() => setErreur(true));
  }

  useEffect(() => {
    charger();
  }, []);

  function chercher() {
    navigation.navigate('Boutiques', { q: terme.trim() });
  }

  const s = donnees ? donnees.statistiques : null;
  const categories = donnees ? donnees.categories : [];
  const vedettes = donnees ? donnees.boutiquesVedettes : [];
  const nouvelles = donnees ? donnees.nouvellesBoutiques : [];
  const offres = donnees ? donnees.promotions : [];
  const avis = donnees ? donnees.avisRecents : [];

  const chiffres = [
    { icone: 'storefront-outline', valeur: s ? String(s.boutiques) : '—', libelle: 'Boutiques validées' },
    { icone: 'people-outline', valeur: s ? String(s.clients) : '—', libelle: 'Clients inscrits' },
    { icone: 'calendar-outline', valeur: s ? String(s.reservationsAcceptees) : '—', libelle: 'Réservations acceptées' },
    s && s.avis > 0
      ? { icone: 'star-outline', valeur: `${String(s.noteMoyenne).replace('.', ',')} / 5`, libelle: `${s.avis} avis clients` }
      : { icone: 'phone-portrait-outline', valeur: '3', libelle: 'Paiements mobiles' },
  ];

  function ouvrirOffre(o) {
    if (o.idProduitService) navigation.navigate('Article', { idProduitService: o.idProduitService, nom: o.nomElement });
    else navigation.navigate('FicheBoutique', { idBoutique: o.boutique.idBoutique, nom: o.boutique.nom });
  }

  return (
    <SafeAreaView style={styles.zone} edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Bandeau principal */}
        <LinearGradient colors={degradeHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingBottom: large ? 110 : 80 }]}>
          <View pointerEvents="none" style={[styles.forme, { width: 340, height: 340, top: -120, right: -80, backgroundColor: 'rgba(255,255,255,0.07)' }]} />
          <View pointerEvents="none" style={[styles.forme, { width: 200, height: 200, bottom: 20, left: -70, backgroundColor: `${ACCENT}33` }]} />
          <View pointerEvents="none" style={[styles.forme, { width: 120, height: 120, top: 220, right: '40%', backgroundColor: `${TURQ}33` }]} />
          <SafeAreaView edges={['top']}>
            <View style={styles.conteneur}>
              {/* Barre de navigation */}
              <View style={styles.navbar}>
                <View style={styles.logo}>
                  <View style={styles.logoRond}>
                    <Ionicons name="storefront" size={18} color={couleurs.primaire} />
                  </View>
                  <Text style={styles.logoNom}>Marketplace</Text>
                </View>
                {large ? (
                  <View style={styles.liens}>
                    <Pressable onPress={() => navigation.navigate('Boutiques')}>
                      <Text style={styles.lien}>Boutiques</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('Contact')}>
                      <Text style={styles.lien}>Contact</Text>
                    </Pressable>
                  </View>
                ) : null}
                <View style={styles.actionsBarre}>
                  <BoutonTheme surFond petit />
                  <Pressable onPress={() => navigation.navigate('Connexion')} hitSlop={8}>
                    <Text style={styles.lien}>Connexion</Text>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('Inscription')} style={styles.inscrire}>
                    <Text style={styles.inscrireTexte}>S'inscrire</Text>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.heroLigne, large && styles.heroLigneLarge]}>
                <View style={large ? { flex: 1.15 } : null}>
                  <View style={styles.etiquette}>
                    <View style={styles.etiquettePoint} />
                    <Text style={styles.etiquetteTexte}>Réservation en ligne · Madagascar</Text>
                  </View>
                  <Text style={[styles.titreHero, large && styles.titreHeroLarge]}>
                    Réservez chez vos commerçants <Text style={styles.titreSurligne}>préférés</Text>, en quelques secondes
                  </Text>
                  <Text style={styles.sousTitreHero}>
                    Découvrez des boutiques près de chez vous, réservez un produit ou un service, payez avec votre
                    mobile et suivez tout depuis un seul endroit.
                  </Text>

                  <View style={styles.rechercheCarte}>
                    <Ionicons name="search" size={20} color={couleurs.texteSecondaire} />
                    <TextInput
                      style={styles.champ}
                      value={terme}
                      onChangeText={setTerme}
                      onSubmitEditing={chercher}
                      placeholder="Quelle boutique cherchez-vous ?"
                      placeholderTextColor={couleurs.texteSecondaire}
                      returnKeyType="search"
                    />
                    <Pressable onPress={chercher} style={styles.boutonChercher}>
                      <Text style={styles.boutonChercherTexte}>Rechercher</Text>
                    </Pressable>
                  </View>

                  {categories.length > 0 ? (
                    <View style={styles.populaires}>
                      <Text style={styles.populairesTitre}>Populaires :</Text>
                      {categories.slice(0, 3).map((c) => (
                        <Pressable
                          key={c.idCategorie}
                          onPress={() => navigation.navigate('Boutiques', { categorie: c.idCategorie })}
                          style={styles.populaire}
                        >
                          <Text style={styles.populaireTexte}>{c.nom}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.garanties}>
                    {['Gratuit pour les clients', 'Paiement mobile', 'Boutiques validées'].map((g) => (
                      <View key={g} style={styles.garantie}>
                        <Ionicons name="checkmark-circle" size={16} color="#8EE5A8" />
                        <Text style={styles.garantieTexte}>{g}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={large ? { flex: 0.85, alignItems: 'center' } : { marginTop: espaces.l }}>
                  <ApercuApp large={large} />
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.contenu}>
          {/* Chiffres clés, qui chevauchent le bandeau */}
          <View style={styles.statsCarte}>
            {chiffres.map((c, i) => {
              const t = teinte(i);
              return (
                <View key={c.libelle} style={[styles.stat, large && i > 0 && styles.statSepare]}>
                  <View style={[styles.statIcone, { backgroundColor: t.fond }]}>
                    <Ionicons name={c.icone} size={22} color={t.couleur} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statValeur} numberOfLines={1}>{c.valeur}</Text>
                    <Text style={styles.statLibelle} numberOfLines={1}>{c.libelle}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {erreur ? (
            <View style={styles.erreur}>
              <Text style={styles.erreurTexte}>Impossible de charger les données. Vérifiez que le serveur est lancé.</Text>
              <Pressable onPress={charger}>
                <Text style={styles.lienSection}>Réessayer</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Catégories */}
          {categories.length > 0 ? (
            <View style={styles.section}>
              <EnteteSection etiquette="Catégories" titre="Explorer par catégorie" centre={false} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
                {categories.map((c, i) => {
                  const t = teinte(i);
                  return (
                    <Pressable
                      key={c.idCategorie}
                      onPress={() => navigation.navigate('Boutiques', { categorie: c.idCategorie })}
                      style={styles.categorie}
                    >
                      <View style={[styles.categorieRond, { backgroundColor: t.fond }]}>
                        <Text style={[styles.categorieLettre, { color: t.couleur }]}>{(c.nom || '?').charAt(0).toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={styles.categorieNom} numberOfLines={1}>{c.nom}</Text>
                        <Text style={styles.categorieNombre}>
                          {c.nombreBoutiques} boutique{c.nombreBoutiques > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* Boutiques vedettes */}
          {vedettes.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.ligneEntete}>
                <EnteteSection etiquette="À la une" titre="Boutiques à découvrir" centre={false} />
                <Pressable onPress={() => navigation.navigate('Boutiques')} style={styles.voirTout}>
                  <Text style={styles.lienSection}>Voir tout</Text>
                  <Ionicons name="arrow-forward" size={14} color={couleurs.primaire} />
                </Pressable>
              </View>
              <View style={large ? styles.grilleBoutiquesLarge : null}>
                {vedettes.map((b) => (
                  <View key={b.idBoutique} style={large ? styles.celluleBoutique : null}>
                    <CarteBoutique
                      boutique={b}
                      onPress={() => navigation.navigate('FicheBoutique', { idBoutique: b.idBoutique, nom: b.nom })}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Offres */}
          {offres.length > 0 ? (
            <View style={styles.section}>
              <EnteteSection etiquette="Bons plans" titre="Offres spéciales" centre={false} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offres}>
                {offres.map((o, i) => (
                  <Pressable key={o.idPromotion} onPress={() => ouvrirOffre(o)} style={styles.offre}>
                    <LinearGradient colors={DEGRADES_OFFRES[i % DEGRADES_OFFRES.length]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.offreInterieur}>
                      <View style={styles.offreBulle} />
                      <Text style={styles.offreRemise}>{libelleRemise(o)}</Text>
                      <Text style={styles.offreTitre} numberOfLines={1}>{o.titre}</Text>
                      <Text style={styles.offreSous} numberOfLines={1}>
                        {o.nomElement || 'Toute la boutique'} · {o.boutique.nom}
                      </Text>
                      <View style={styles.offreFin}>
                        <Ionicons name="time-outline" size={13} color="#FFFFFF" />
                        <Text style={styles.offreFinTexte}>Jusqu'au {jourMois(o.dateFin)}</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Nouvelles boutiques */}
          {nouvelles.length > 0 ? (
            <View style={styles.section}>
              <EnteteSection etiquette="Nouveautés" titre="Nouvelles boutiques" centre={false} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
                {nouvelles.map((b, i) => {
                  const t = teinte(i + 1);
                  return (
                    <Pressable
                      key={b.idBoutique}
                      onPress={() => navigation.navigate('FicheBoutique', { idBoutique: b.idBoutique, nom: b.nom })}
                      style={styles.nouvelle}
                    >
                      <View style={[styles.categorieRond, { backgroundColor: t.fond }]}>
                        <Text style={[styles.categorieLettre, { color: t.couleur }]}>{(b.nom || '?').charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={styles.categorieNom} numberOfLines={1}>{b.nom}</Text>
                        <Text style={styles.categorieNombre} numberOfLines={1}>
                          {b.categorie ? b.categorie.nom : ''}{b.ville ? ` · ${b.ville}` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* Atouts */}
          <View style={styles.section}>
            <EnteteSection etiquette="Pourquoi nous" titre="Tout pour réserver sereinement" texte="Une plateforme pensée pour les clients comme pour les commerçants." />
            <View style={styles.grille}>
              {ATOUTS.map((a, i) => {
                const t = teinte(i);
                return (
                  <View key={a.titre} style={[styles.atout, large && styles.atoutLarge]}>
                    <View style={[styles.atoutIcone, { backgroundColor: t.fond }]}>
                      <Ionicons name={a.icone} size={24} color={t.couleur} />
                    </View>
                    <Text style={styles.atoutTitre}>{a.titre}</Text>
                    <Text style={styles.atoutTexte}>{a.texte}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Étapes */}
          <View style={styles.section}>
            <EnteteSection etiquette="Simple et rapide" titre="Comment ça marche ?" />
            <View style={[styles.etapes, large && styles.etapesLarge]}>
              {ETAPES.map((e, i) => {
                const t = teinte(i);
                return (
                  <View key={e.titre} style={[styles.etape, large && { flex: 1 }]}>
                    <View style={styles.etapeHaut}>
                      <View style={[styles.etapeIcone, { backgroundColor: t.fond }]}>
                        <Ionicons name={e.icone} size={24} color={t.couleur} />
                      </View>
                      <Text style={[styles.etapeNumero, { color: t.fond }]}>0{i + 1}</Text>
                    </View>
                    <Text style={styles.etapeTitre}>{e.titre}</Text>
                    <Text style={styles.etapeTexte}>{e.texte}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Avis des clients : seulement de vrais avis */}
          {avis.length > 0 ? (
            <View style={styles.section}>
              <EnteteSection etiquette="Témoignages" titre="Ce que disent nos clients" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.temoignages}>
                {avis.map((a, i) => {
                  const t = teinte(i);
                  return (
                    <View key={a.idAvis} style={styles.temoignage}>
                      <View style={[styles.guillemets, { backgroundColor: t.fond }]}>
                        <Ionicons name="chatbubble-ellipses" size={18} color={t.couleur} />
                      </View>
                      <Etoiles note={a.note} taille={15} style={{ marginTop: espaces.s + 4 }} />
                      <Text style={styles.temoignageTexte} numberOfLines={5}>« {a.commentaire} »</Text>
                      <Text style={styles.temoignageNom}>{a.client}</Text>
                      {a.boutique ? <Text style={styles.temoignageBoutique}>{a.boutique.nom}</Text> : null}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* Commerçants */}
          <LinearGradient colors={['#2A2563', '#4D4398']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <View pointerEvents="none" style={[styles.forme, { width: 220, height: 220, top: -80, right: -60, backgroundColor: `${ACCENT}30` }]} />
            <View style={large ? { flexDirection: 'row', alignItems: 'center', gap: espaces.xl } : null}>
              <View style={large ? { flex: 1 } : null}>
                <Text style={styles.ctaEtiquette}>POUR LES COMMERÇANTS</Text>
                <Text style={styles.ctaTitre}>Développez votre activité avec Marketplace</Text>
                <Text style={styles.ctaTexte}>
                  Ouvrez votre boutique en ligne et laissez vos clients réserver et payer quand ils veulent.
                </Text>
                <Pressable onPress={() => navigation.navigate('Inscription')} style={styles.ctaBouton}>
                  <Text style={styles.ctaBoutonTexte}>Ouvrir ma boutique</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
              <View style={[styles.avantages, large && { flex: 1 }]}>
                {AVANTAGES_COMMERCANT.map((a) => (
                  <View key={a} style={styles.avantage}>
                    <View style={styles.avantageCoche}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.avantageTexte}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>

          {/* Contact */}
          <Pressable onPress={() => navigation.navigate('Contact')} style={styles.contact}>
            <View style={styles.contactIcone}>
              <Ionicons name="mail-outline" size={22} color={couleurs.primaire} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitre}>Une question ?</Text>
              <Text style={styles.contactTexte}>Écrivez-nous, nous vous répondons rapidement.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={couleurs.texteSecondaire} />
          </Pressable>
        </View>

        {/* Pied de page */}
        <View style={styles.pied}>
          <View style={styles.logo}>
            <View style={styles.logoRond}>
              <Ionicons name="storefront" size={16} color={couleurs.primaire} />
            </View>
            <Text style={styles.piedNom}>Marketplace Madagascar</Text>
          </View>
          <Text style={styles.piedTexte}>Réservez auprès des commerces près de chez vous.</Text>
          <View style={styles.piedLiens}>
            <Pressable onPress={() => navigation.navigate('Boutiques')}>
              <Text style={styles.piedLien}>Boutiques</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Connexion')}>
              <Text style={styles.piedLien}>Connexion</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Inscription')}>
              <Text style={styles.piedLien}>Créer un compte</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Contact')}>
              <Text style={styles.piedLien}>Contact</Text>
            </Pressable>
          </View>
          <Text style={styles.piedCopie}>© 2026 Marketplace Madagascar</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const creerStyles = () => StyleSheet.create({
  zone: { flex: 1, backgroundColor: couleurs.fond },
  hero: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  forme: { position: 'absolute', borderRadius: 999 },
  conteneur: { width: '100%', maxWidth: 1100, alignSelf: 'center', paddingHorizontal: espaces.m },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: espaces.m,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoRond: { width: 34, height: 34, borderRadius: 17, backgroundColor: couleurs.carte, alignItems: 'center', justifyContent: 'center' },
  logoNom: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  liens: { flexDirection: 'row', gap: espaces.l },
  lien: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  actionsBarre: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  inscrire: { backgroundColor: couleurs.carte, borderRadius: 20, paddingHorizontal: 16, height: 36, alignItems: 'center', justifyContent: 'center' },
  inscrireTexte: { fontSize: 13, fontWeight: '700', color: couleurs.primaire },
  heroLigne: { marginTop: espaces.l },
  heroLigneLarge: { flexDirection: 'row', alignItems: 'center', gap: espaces.xl, marginTop: espaces.xl },
  etiquette: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  etiquettePoint: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT },
  etiquetteTexte: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  titreHero: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginTop: espaces.m, lineHeight: 40 },
  titreHeroLarge: { fontSize: 46, lineHeight: 54 },
  titreSurligne: { color: '#FFC9A8' },
  sousTitreHero: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: espaces.m, lineHeight: 23, maxWidth: 560 },
  rechercheCarte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.carte,
    borderRadius: 28,
    paddingLeft: 18,
    paddingRight: 6,
    height: 60,
    marginTop: espaces.l,
    maxWidth: 580,
    ...ombre,
  },
  champ: { flex: 1, fontSize: 15, color: couleurs.texte, height: 60 },
  boutonChercher: { height: 46, borderRadius: 23, paddingHorizontal: 20, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  boutonChercherTexte: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  populaires: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: espaces.m },
  populairesTitre: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  populaire: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  populaireTexte: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  garanties: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m, marginTop: espaces.m },
  garantie: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  garantieTexte: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  apercuZone: { width: 440, height: 380 },
  apercuPosition: { position: 'absolute', width: 290 },
  carteApercu: { backgroundColor: couleurs.carte, borderRadius: 20, padding: 14, gap: 10, shadowColor: '#1E1B3F', shadowOpacity: 0.22, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  apercuLigne: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  apercuIcone: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  apercuTitre: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  apercuSous: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 2 },
  bulleOffre: { position: 'absolute', top: 60, right: 40, width: 70, height: 70, borderRadius: 35, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-10deg' }] },
  bulleOffreTexte: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  miniPastille: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  miniPoint: { width: 6, height: 6, borderRadius: 3 },
  miniPastilleTexte: { fontSize: 12, fontWeight: '700' },
  contenu: { width: '100%', maxWidth: 1100, alignSelf: 'center', paddingHorizontal: espaces.m, paddingBottom: espaces.m },
  statsCarte: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: couleurs.carte,
    borderRadius: 26,
    padding: espaces.m,
    marginTop: -50,
    gap: espaces.m,
    ...ombre,
  },
  stat: { flexGrow: 1, flexBasis: '44%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  statSepare: { borderLeftWidth: 1, borderLeftColor: couleurs.bordure, paddingLeft: espaces.m },
  statIcone: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statValeur: { fontSize: 22, fontWeight: '800', color: couleurs.texte },
  statLibelle: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 1 },
  erreur: { backgroundColor: couleurs.erreurFond, borderRadius: 16, padding: espaces.m, marginTop: espaces.m, gap: 6 },
  erreurTexte: { fontSize: 13, color: couleurs.erreur, fontWeight: '600' },
  section: { marginTop: espaces.xl },
  enteteSection: { marginBottom: espaces.m },
  etiquetteSection: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: ACCENT, marginBottom: 4 },
  titreSection: { fontSize: 24, fontWeight: '800', color: couleurs.texte },
  texteSection: { fontSize: 14, color: couleurs.texteSecondaire, marginTop: 6, maxWidth: 520 },
  ligneEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  voirTout: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: espaces.m },
  lienSection: { fontSize: 14, fontWeight: '700', color: couleurs.primaire },
  categories: { gap: espaces.s + 4, paddingBottom: 8 },
  categorie: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: couleurs.carte, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14, ...ombre },
  nouvelle: { width: 230, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: couleurs.carte, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14, ...ombre },
  categorieRond: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  categorieLettre: { fontSize: 20, fontWeight: '800' },
  categorieNom: { fontSize: 14, fontWeight: '700', color: couleurs.texte },
  categorieNombre: { fontSize: 11, color: couleurs.texteSecondaire, marginTop: 1 },
  grilleBoutiquesLarge: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m },
  celluleBoutique: { width: '48.5%' },
  offres: { gap: espaces.m, paddingBottom: 8 },
  offre: { width: 250, borderRadius: 26, ...ombre },
  offreInterieur: { padding: espaces.m + 2, borderRadius: 26, minHeight: 150, justifyContent: 'space-between', overflow: 'hidden' },
  offreBulle: { position: 'absolute', width: 130, height: 130, borderRadius: 65, top: -40, right: -30, backgroundColor: 'rgba(255,255,255,0.14)' },
  offreRemise: { fontSize: 34, fontWeight: '800', color: '#FFFFFF' },
  offreTitre: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  offreSous: { fontSize: 12, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
  offreFin: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: espaces.s },
  offreFinTexte: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m, marginTop: espaces.s },
  atout: { flexGrow: 1, flexBasis: '100%', backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m + 4, ...ombre },
  atoutLarge: { flexBasis: '31%' },
  atoutIcone: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: espaces.s + 6 },
  atoutTitre: { fontSize: 16, fontWeight: '700', color: couleurs.texte },
  atoutTexte: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4, lineHeight: 20 },
  etapes: { gap: espaces.m, marginTop: espaces.s },
  etapesLarge: { flexDirection: 'row' },
  etape: { backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m + 4, ...ombre },
  etapeHaut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaces.m },
  etapeIcone: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  etapeNumero: { fontSize: 44, fontWeight: '800' },
  etapeTitre: { fontSize: 18, fontWeight: '700', color: couleurs.texte },
  etapeTexte: { fontSize: 13, color: couleurs.texteSecondaire, marginTop: 4, lineHeight: 20 },
  temoignages: { gap: espaces.m, paddingVertical: espaces.s, paddingBottom: 10 },
  temoignage: { width: 300, backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m + 4, ...ombre },
  guillemets: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  temoignageTexte: { fontSize: 14, color: couleurs.texte, marginTop: espaces.s + 4, lineHeight: 21 },
  temoignageNom: { fontSize: 13, fontWeight: '700', color: couleurs.primaire, marginTop: espaces.s + 4 },
  temoignageBoutique: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
  cta: { borderRadius: 32, padding: espaces.l, marginTop: espaces.xl, overflow: 'hidden' },
  ctaEtiquette: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#FFC9A8' },
  ctaTitre: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 6, lineHeight: 33 },
  ctaTexte: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginVertical: espaces.m, lineHeight: 21 },
  ctaBouton: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: ACCENT, borderRadius: 26, paddingHorizontal: 22, height: 50 },
  ctaBoutonTexte: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  avantages: { gap: 12, marginTop: espaces.l },
  avantage: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 },
  avantageCoche: { width: 24, height: 24, borderRadius: 12, backgroundColor: TURQ, alignItems: 'center', justifyContent: 'center' },
  avantageTexte: { flex: 1, fontSize: 13, color: '#FFFFFF' },
  contact: { flexDirection: 'row', alignItems: 'center', gap: espaces.s + 4, backgroundColor: couleurs.carte, borderRadius: rayon, padding: espaces.m, marginTop: espaces.m, ...ombre },
  contactIcone: { width: 46, height: 46, borderRadius: 15, backgroundColor: couleurs.primaireClair, alignItems: 'center', justifyContent: 'center' },
  contactTitre: { fontSize: 15, fontWeight: '700', color: couleurs.texte },
  contactTexte: { fontSize: 12, color: couleurs.texteSecondaire, marginTop: 2 },
  pied: { backgroundColor: couleurs.contraste, marginTop: espaces.xl, padding: espaces.l, alignItems: 'center' },
  piedNom: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  piedTexte: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8, textAlign: 'center' },
  piedLiens: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: espaces.l, marginTop: espaces.m },
  piedLien: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  piedCopie: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: espaces.m },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});