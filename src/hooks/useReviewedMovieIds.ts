import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getReviewedMovieIds } from '../services/movieReviewService';

// Set de ids de películas ya calificadas, para el filtro "Calificadas" del
// listado. Se recarga con useFocusEffect (no solo al montar) porque el
// usuario suele calificar en el detalle y volver a esta pantalla sin que
// se desmonte/remonte.
export function useReviewedMovieIds() {
  const [ids, setIds] = useState<Set<number>>(new Set());

  const load = useCallback(() => {
    getReviewedMovieIds()
      .then((reviewedIds) => setIds(new Set(reviewedIds)))
      .catch(() => setIds(new Set()));
  }, []);

  useFocusEffect(load);

  return ids;
}
