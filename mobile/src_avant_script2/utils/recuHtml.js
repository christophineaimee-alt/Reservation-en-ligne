import { formatDateHeure, formatPrix } from './format';

function echapper(texte) {
  return String(texte === null || texte === undefined ? '' : texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ligne(titre, valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return '';
  return `<tr><td class="t">${echapper(titre)}</td><td class="v">${echapper(valeur)}</td></tr>`;
}

// HTML du reçu (converti en PDF par expo-print)
export function recuHtml(recu) {
  const boutique = recu.boutique || {};
  const lieu = [boutique.adresse, boutique.ville].filter(Boolean).join(', ');
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Reçu ${echapper(recu.numero)}</title>
<style>
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1D1B3A; margin: 0; padding: 24px; background: #FFFFFF; }
  .recu { max-width: 480px; margin: 0 auto; border: 1px solid #ECEAF8; border-radius: 20px; overflow: hidden; }
  .haut { background: linear-gradient(135deg, #B014F2, #6C2DF4); color: #FFFFFF; text-align: center; padding: 28px 20px; }
  .haut .titre { font-size: 14px; opacity: 0.9; }
  .haut .montant { font-size: 34px; font-weight: 800; margin: 8px 0; }
  .haut .numero { font-size: 13px; opacity: 0.9; }
  .demo { background: #FFF4DB; color: #8A5A00; font-size: 12px; text-align: center; padding: 8px 12px; }
  .corps { padding: 20px 24px; }
  h2 { font-size: 12px; letter-spacing: 0.6px; color: #8C8FA6; margin: 18px 0 6px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 5px 0; font-size: 14px; vertical-align: top; }
  td.t { color: #8C8FA6; width: 42%; }
  td.v { text-align: right; font-weight: 600; }
  hr { border: none; border-top: 1px dashed #D9D6EE; margin: 16px 0; }
  .pied { text-align: center; font-size: 12px; color: #8C8FA6; padding: 0 24px 22px; }
</style>
</head>
<body>
  <div class="recu">
    <div class="haut">
      <div class="titre">Reçu de paiement</div>
      <div class="montant">${echapper(formatPrix(recu.montant))}</div>
      <div class="numero">N° ${echapper(recu.numero)}</div>
    </div>
    ${recu.simulation ? '<div class="demo">Reçu de démonstration : paiement simulé, aucun argent réel prélevé.</div>' : ''}
    <div class="corps">
      <h2>Boutique</h2>
      <table>${ligne('Nom', boutique.nom)}${ligne('Adresse', lieu)}${ligne('Téléphone', boutique.telephone)}</table>
      <hr />
      <h2>Client</h2>
      <table>${ligne('Nom', recu.client)}</table>
      <hr />
      <h2>Détail</h2>
      <table>
        ${ligne('Article', recu.element.nom)}
        ${recu.element.type === 'PRODUIT' ? ligne('Quantité', recu.element.quantite) : ''}
        ${ligne('Prix unitaire', formatPrix(recu.element.prixUnitaire))}
        ${ligne('Rendez-vous', formatDateHeure(recu.rendezVous))}
        ${ligne('Réservation', `n° ${recu.idReservation}`)}
      </table>
      <hr />
      <h2>Paiement</h2>
      <table>
        ${ligne('Montant payé', formatPrix(recu.montant))}
        ${ligne('Opérateur', recu.operateurLibelle)}
        ${ligne('Numéro', recu.telephone)}
        ${ligne('Date', formatDateHeure(recu.datePaiement))}
        ${ligne('Référence', recu.referenceInterne)}
      </table>
    </div>
    <div class="pied">Merci pour votre confiance.</div>
  </div>
</body>
</html>`;
}