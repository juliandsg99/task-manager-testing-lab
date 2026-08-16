import { useCallback, useEffect, useState } from 'react';
import { fetchMovieDetail } from '../services/movieService';
import { Movie } from '../types/movie';

// A partir de un set de ids calificados (useReviewedMovieIds), trae el
// detalle completo de cada película. Es necesario porque solo se guarda el
// id + la reseña localmente: para mostrar título/póster/etc. en el filtro
// "Calificadas" hay que consultar la API por cada una, sin importar si esa
// película está o no en el listado de próximos estrenos o en la búsqueda
// actual (una película calificada puede haberse encontrado por búsqueda y
// no aparecer nunca en "upcoming").
export function useReviewedMovies(reviewedIds: Set<number>) {
  // Clave estable (no cambia si el Set es un objeto distinto pero con el
  // mismo contenido) para no volver a pedir todo cada vez que
  // useReviewedMovieIds recrea el Set al refocuscar la pantalla.
  const idsKey = Array.from(reviewedIds).sort((a, b) => a - b).join(',');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const load = useCallback(() => {
    const ids = idsKey ? idsKey.split(',').map(Number) : [];
    if (ids.length === 0) {
      setMovies([]);
      setStatus('success');
      return;
    }
    setStatus('loading');
    Promise.all(ids.map((id) => fetchMovieDetail(id)))
      .then((details) => {
        setMovies(details);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [idsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { movies, status, reload: load };
}
