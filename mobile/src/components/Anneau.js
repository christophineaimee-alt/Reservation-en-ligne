import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { couleurs } from '../theme';

export default function Anneau({ pourcentage = 0, taille = 44, epaisseur = 5, couleur = couleurs.primaire, fond = couleurs.primaireClair }) {
  const rayon = (taille - epaisseur) / 2;
  const circ = 2 * Math.PI * rayon;
  const p = Math.max(0, Math.min(100, pourcentage));
  const centre = taille / 2;
  return (
    <Svg width={taille} height={taille}>
      <Circle cx={centre} cy={centre} r={rayon} stroke={fond} strokeWidth={epaisseur} fill="none" />
      <Circle
        cx={centre}
        cy={centre}
        r={rayon}
        stroke={couleur}
        strokeWidth={epaisseur}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(circ * p) / 100} ${circ}`}
        transform={`rotate(-90 ${centre} ${centre})`}
      />
    </Svg>
  );
}