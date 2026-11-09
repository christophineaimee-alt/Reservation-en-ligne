/*
// Page HTML de la carte (Leaflet + OpenStreetMap), partagée par le web (iframe) et le téléphone (WebView)
export function htmlCarte(centre, points, moi) {
    const donnees = JSON.stringify({ centre, points, moi: moi || null })
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#m{height:100%;margin:0;font-family:Arial,sans-serif}
.pin{width:26px;height:26px;border-radius:50% 50% 50% 0;background:#9A1CF0;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg)}
.pin span{display:block;transform:rotate(45deg);color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:20px}
.voir{margin-top:6px;background:#9A1CF0;color:#fff;border:0;border-radius:14px;padding:6px 12px;font-weight:700;cursor:pointer}
</style></head>
<body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var D=${donnees};
function post(m){
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(m));}
  else{window.parent.postMessage(m,'*');}
}
var map=L.map('m').setView([D.centre.lat,D.centre.lng],13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
var bornes=[[D.centre.lat,D.centre.lng]];
if(D.moi){
  L.circleMarker([D.moi.lat,D.moi.lng],{radius:8,color:'#fff',weight:3,fillColor:'#1E6FF0',fillOpacity:1}).addTo(map).bindTooltip('Vous êtes ici');
}
D.points.forEach(function(p,i){
  var icone=L.divIcon({className:'',html:'<div class="pin"><span>'+(i+1)+'</span></div>',iconSize:[26,26],iconAnchor:[13,26],popupAnchor:[0,-26]});
  var m=L.marker([p.lat,p.lng],{icon:icone}).addTo(map);
  var boite=document.createElement('div');
  var titre=document.createElement('b');titre.textContent=p.nom;boite.appendChild(titre);
  if(p.texte){var t=document.createElement('div');t.textContent=p.texte;boite.appendChild(t);}
  if(p.id!==undefined&&p.id!==null){
    var b=document.createElement('button');b.className='voir';b.textContent='Voir la boutique';
    b.onclick=function(){post({type:'boutique',id:p.id});};
    boite.appendChild(b);
  }
  m.bindPopup(boite);
  bornes.push([p.lat,p.lng]);
});
if(bornes.length>1){map.fitBounds(bornes,{padding:[30,30],maxZoom:15});}
</script></body></html>`;
}
*/
// Page HTML de la carte (Leaflet + OpenStreetMap), partagée par le web (iframe) et le téléphone (WebView)

// Vrai si la couleur de fond du thème est foncée (mode sombre)
export function estSombre(fond) {
  const c = String(fond || '#ffffff').replace('#', '');
  const hex = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 < 110;
}

export function htmlCarte(centre, points, moi, sombre = false) {
  const donnees = JSON.stringify({ centre, points, moi: moi || null }).replace(/</g, '\\u003c');
  const fond = sombre ? '#1b1b22' : '#ffffff';
  const filtre = sombre
    ? '.leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.9) contrast(.9);}'
    + '.leaflet-container{background:#1b1b22;}'
    + '.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#2a2a33;color:#f2f2f5;}'
    + '.leaflet-control-attribution{background:rgba(27,27,34,.8)!important;color:#aaa!important;}'
    + '.leaflet-control-attribution a{color:#ccc!important;}'
    + '.leaflet-bar a{background:#2a2a33;color:#f2f2f5;border-color:#444;}'
    : '';
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#m{height:100%;margin:0;font-family:Arial,sans-serif;background:${fond}}
.pin{width:26px;height:26px;border-radius:50% 50% 50% 0;background:#9A1CF0;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg)}
.pin span{display:block;transform:rotate(45deg);color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:20px}
.voir{margin-top:6px;background:#9A1CF0;color:#fff;border:0;border-radius:14px;padding:6px 12px;font-weight:700;cursor:pointer}
${filtre}
</style></head>
<body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var D=${donnees};
function post(m){
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(m));}
  else{window.parent.postMessage(m,'*');}
}
var map=L.map('m').setView([D.centre.lat,D.centre.lng],13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
var bornes=[[D.centre.lat,D.centre.lng]];
if(D.moi){
  L.circleMarker([D.moi.lat,D.moi.lng],{radius:8,color:'#fff',weight:3,fillColor:'#1E6FF0',fillOpacity:1}).addTo(map).bindTooltip('Vous êtes ici');
}
D.points.forEach(function(p,i){
  var icone=L.divIcon({className:'',html:'<div class="pin"><span>'+(i+1)+'</span></div>',iconSize:[26,26],iconAnchor:[13,26],popupAnchor:[0,-26]});
  var m=L.marker([p.lat,p.lng],{icon:icone}).addTo(map);
  var boite=document.createElement('div');
  var titre=document.createElement('b');titre.textContent=p.nom;boite.appendChild(titre);
  if(p.texte){var t=document.createElement('div');t.textContent=p.texte;boite.appendChild(t);}
  if(p.id!==undefined&&p.id!==null){
    var b=document.createElement('button');b.className='voir';b.textContent='Voir la boutique';
    b.onclick=function(){post({type:'boutique',id:p.id});};
    boite.appendChild(b);
  }
  m.bindPopup(boite);
  bornes.push([p.lat,p.lng]);
});
if(bornes.length>1){map.fitBounds(bornes,{padding:[30,30],maxZoom:15});}
</script></body></html>`;
}