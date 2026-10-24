import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

// Nombre de notifications non lues (rechargé à chaque affichage de l'écran)
export default function useNonLues() {
  const [nonLues, setNonLues] = useState(0);

  useFocusEffect(
    useCallback(() => {
      api
        .get('/notifications', { params: { limite: 1 } })
        .then(({ data }) => setNonLues(data.nonLues))
        .catch(() => {});
    }, [])
  );

  return nonLues;
}