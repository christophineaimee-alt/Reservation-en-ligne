import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs } from '../theme';

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const JOURS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

function ymd(annee, mois, jour) {
  return `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
}

// choisi : 'AAAA-MM-JJ' ; marques : dates avec un point ; minimum : 'AAAA-MM-JJ' (jours avant = grisés)
export default function Calendrier({ choisi, onChoisir, marques = [], minimum }) {
  const maintenant = new Date();
  const [affiche, setAffiche] = useState({ annee: maintenant.getFullYear(), mois: maintenant.getMonth() });
  const { annee, mois } = affiche;
  const aujourdhui = ymd(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const marquees = new Set(marques);

  const decalage = (new Date(annee, mois, 1).getDay() + 6) % 7; // la semaine commence le lundi
  const nombreJours = new Date(annee, mois + 1, 0).getDate();
  const cases = [];
  for (let i = 0; i < decalage; i += 1) cases.push(null);
  for (let j = 1; j <= nombreJours; j += 1) cases.push(j);
  while (cases.length % 7 !== 0) cases.push(null);
  const semaines = [];
  for (let i = 0; i < cases.length; i += 7) semaines.push(cases.slice(i, i + 7));

  function changer(delta) {
    const d = new Date(annee, mois + delta, 1);
    setAffiche({ annee: d.getFullYear(), mois: d.getMonth() });
  }

  return (
    <View>
      <View style={styles.entete}>
        <Text style={styles.mois}>{MOIS[mois]} {annee}</Text>
        <View style={styles.fleches}>
          <Pressable onPress={() => changer(-1)} hitSlop={8}>
            <Ionicons name="chevron-back" size={18} color={couleurs.primaire} />
          </Pressable>
          <Pressable onPress={() => changer(1)} hitSlop={8}>
            <Ionicons name="chevron-forward" size={18} color={couleurs.primaire} />
          </Pressable>
        </View>
      </View>
      <View style={styles.ligne}>
        {JOURS.map((j) => (
          <Text key={j} style={styles.nomJour}>{j}</Text>
        ))}
      </View>
      {semaines.map((semaine, s) => (
        <View key={s} style={styles.ligne}>
          {semaine.map((jour, i) => {
            if (!jour) return <View key={i} style={styles.case} />;
            const valeur = ymd(annee, mois, jour);
            const selectionne = valeur === choisi;
            const passe = Boolean(minimum) && valeur < minimum;
            return (
              <Pressable
                key={i}
                style={styles.case}
                disabled={passe}
                onPress={() => onChoisir && onChoisir(valeur)}
              >
                <View style={[styles.rond, selectionne && styles.rondChoisi]}>
                  <Text
                    style={[
                      styles.jour,
                      valeur === aujourdhui && styles.jourAujourdhui,
                      passe && styles.jourPasse,
                      selectionne && styles.jourChoisi,
                    ]}
                  >
                    {jour}
                  </Text>
                </View>
                {marquees.has(valeur) && !selectionne ? <View style={styles.marque} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mois: { fontSize: 14, fontWeight: '600', color: couleurs.texte },
  fleches: { flexDirection: 'row', gap: 14 },
  ligne: { flexDirection: 'row' },
  nomJour: { width: '14.2857%', textAlign: 'center', fontSize: 10, color: couleurs.texteSecondaire, marginBottom: 6 },
  case: { width: '14.2857%', height: 40, alignItems: 'center', justifyContent: 'center' },
  rond: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rondChoisi: { backgroundColor: couleurs.primaire },
  jour: { fontSize: 13, color: couleurs.texte },
  jourAujourdhui: { color: couleurs.primaire, fontWeight: '700' },
  jourPasse: { color: '#C9CBDA' },
  jourChoisi: { color: '#FFFFFF', fontWeight: '700' },
  marque: { position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, backgroundColor: couleurs.primaire },
});