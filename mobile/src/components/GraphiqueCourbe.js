import { enregistrerStyles } from '../theme/registre';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { couleurs } from '../theme';

const GAUCHE = 34;
const DROITE = 12;
const HAUT = 14;
const BAS = 26;

// Courbe lisse qui passe par tous les points
function courbe(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// donnees : [{ libelle, valeur }]
export default function GraphiqueCourbe({
  donnees,
  hauteur = 190,
  formatAxe = (v) => String(v),
  formatInfo = (v) => `${v} réserv.`,
}) {
  const [largeur, setLargeur] = useState(0);
  const [choisi, setChoisi] = useState(null);
  const n = donnees.length;
  const max = Math.max(1, ...donnees.map((d) => d.valeur));
  const sommet = Math.max(3, Math.ceil(max / 3) * 3);
  const w = Math.max(0, largeur - GAUCHE - DROITE);
  const h = hauteur - HAUT - BAS;
  const base = HAUT + h;
  const x = (i) => GAUCHE + (n === 1 ? w / 2 : (i * w) / (n - 1));
  const y = (v) => HAUT + h - (v / sommet) * h;
  const points = donnees.map((d, i) => ({ x: x(i), y: y(d.valeur) }));
  const indexMax = donnees.reduce((m, d, i, t) => (d.valeur > t[m].valeur ? i : m), 0);
  const actif = choisi === null || choisi >= n ? indexMax : choisi;
  const pas = Math.ceil(n / 7);
  const graduations = [0, 1, 2, 3].map((k) => Math.round((sommet * k) / 3));

  function toucher(e) {
    const px = e.nativeEvent.locationX;
    let meilleur = 0;
    let ecart = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - px);
      if (d < ecart) {
        ecart = d;
        meilleur = i;
      }
    });
    setChoisi(meilleur);
  }

  return (
    <View style={{ height: hauteur }} onLayout={(e) => setLargeur(e.nativeEvent.layout.width)}>
      {largeur > 0 && n > 0 ? (
        <>
          <Pressable onPress={toucher} style={StyleSheet.absoluteFill}>
            <Svg width={largeur} height={hauteur}>
              <Defs>
                <LinearGradient id="aire" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={couleurs.primaire} stopOpacity="0.18" />
                  <Stop offset="1" stopColor={couleurs.primaire} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              {graduations.map((g) => (
                <Line key={g} x1={GAUCHE} x2={largeur - DROITE} y1={y(g)} y2={y(g)} stroke={couleurs.bordure} strokeWidth="1" />
              ))}
              {n > 1 ? (
                <Path d={`${courbe(points)} L ${points[n - 1].x} ${base} L ${points[0].x} ${base} Z`} fill="url(#aire)" />
              ) : null}
              {n > 1 ? (
                <Path d={courbe(points)} stroke={couleurs.primaire} strokeWidth="3" fill="none" strokeLinecap="round" />
              ) : null}
              <Line
                x1={points[actif].x}
                x2={points[actif].x}
                y1={HAUT}
                y2={base}
                stroke="#B9A5F5"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <Circle cx={points[actif].x} cy={points[actif].y} r="5" fill="#FFFFFF" stroke={couleurs.primaire} strokeWidth="3" />
            </Svg>
          </Pressable>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {graduations.map((g) => (
              <Text key={`y${formatAxe(g)}`} style={[styles.axe, { left: 0, width: GAUCHE - 8, textAlign: 'right', top: y(g) - 7 }]}>
                {g}
              </Text>
            ))}
            {donnees.map((d, i) =>
              i % pas === 0 ? (
                <Text key={`x${i}`} style={[styles.axe, { left: x(i) - 16, width: 32, textAlign: 'center', top: base + 6 }]}>
                  {d.libelle}
                </Text>
              ) : null
            )}
            <View
              style={[
                styles.infobulle,
                {
                  left: Math.min(Math.max(points[actif].x - 45, 0), Math.max(0, largeur - 90)),
                  top: Math.max(points[actif].y - 40, 0),
                },
              ]}
            >
            <Text style={styles.infobulleTexte}>{formatInfo(donnees[actif].valeur)}</Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

const creerStyles = () => StyleSheet.create({
  axe: { position: 'absolute', fontSize: 10, color: couleurs.texteSecondaire },
  infobulle: {
    position: 'absolute',
    width: 90,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: couleurs.contraste,
    alignItems: 'center',
  },
  infobulleTexte: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
let styles = creerStyles();
enregistrerStyles(() => {
  styles = creerStyles();
});