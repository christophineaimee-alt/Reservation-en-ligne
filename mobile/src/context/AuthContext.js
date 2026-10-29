import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { lireJeton, sauverJeton, effacerJeton, definirSurNonAutorise } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  const deconnexion = useCallback(async () => {
    await effacerJeton();
    setUtilisateur(null);
  }, []);

  // Au démarrage : si un jeton est enregistré, on retrouve l'utilisateur
  useEffect(() => {
    definirSurNonAutorise(deconnexion);
    (async () => {
      try {
        const jeton = await lireJeton();
        if (jeton) {
          const { data } = await api.get('/auth/moi');
          setUtilisateur(data.utilisateur);
        }
      } catch (erreur) {
        // Jeton refusé : on l'efface. Serveur injoignable : on le garde.
        if (erreur.response) await effacerJeton();
      } finally {
        setChargement(false);
      }
    })();
  }, [deconnexion]);

  // UC02 : s'authentifier
  const connexion = async (identifiant, motDePasse) => {
    const { data } = await api.post('/auth/connexion', { identifiant, motDePasse });
    await sauverJeton(data.jeton);
    setUtilisateur(data.utilisateur);
    return data.utilisateur;
  };

  // UC01 : s'inscrire (puis l'utilisateur se connecte)
  const inscription = async (donnees) => {
    const { data } = await api.post('/auth/inscription', donnees);
    return data;
  };
    // Après une modification du profil : l'utilisateur affiché partout est mis à jour
  const mettreAJour = (nouveau) => setUtilisateur(nouveau);

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connexion, inscription, deconnexion, mettreAJour }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}