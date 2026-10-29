import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { messageErreur } from '../api/client';

const BoutiqueContext = createContext(null);

export function BoutiqueProvider({ children }) {
  const [boutique, setBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const recharger = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/boutiques/moi');
      setBoutique(data.boutique);
    } catch (e) {
      // 404 : le commerçant n'a pas encore créé sa boutique
      if (e.response && e.response.status === 404) setBoutique(null);
      else setErreur(messageErreur(e));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return (
    <BoutiqueContext.Provider value={{ boutique, chargement, erreur, recharger }}>
      {children}
    </BoutiqueContext.Provider>
  );
}

export function useBoutique() {
  return useContext(BoutiqueContext);
}