import { useEffect, useRef, useState } from 'react';
import { fetchUpcomingMovies, searchMovies } from '../services/movieService';
import { Movie } from '../types/movie';

type Status = 'idle' | 'loading' | 'success' | 'error';
type Mode = 'upcoming' | 'search';

// Encapsula la carga de películas para la pantalla de listado: próximos
// estrenos al montar, y búsqueda por título a pedido del usuario. "mode"
// permite que la pantalla sepa qué listado está mostrando (para el título
// y el mensaje de "sin resultados"), y lastQueryRef permite que "reload"
// reintente la misma acción que falló, sea upcoming o search.
export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [mode, setMode] = useState<Mode>('upcoming');
  const lastQueryRef = useRef('');

  const run = async (fetcher: () => Promise<{ results: Movie[] }>, nextMode: Mode) => {
    setStatus('loading');
    setMode(nextMode);
    try {
      const response = await fetcher();
      setMovies(response.results);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const loadUpcoming = () => {
    lastQueryRef.current = '';
    run(fetchUpcomingMovies, 'upcoming');
  };

  // Un query vacío no tiene sentido para /search/movie, así que se
  // interpreta como "el usuario borró la búsqueda" y se vuelve a upcoming.
  const search = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      loadUpcoming();
      return;
    }
    lastQueryRef.current = trimmed;
    run(() => searchMovies(trimmed), 'search');
  };

  const reload = () => {
    if (mode === 'search' && lastQueryRef.current) {
      run(() => searchMovies(lastQueryRef.current), 'search');
    } else {
      loadUpcoming();
    }
  };

  useEffect(() => {
    loadUpcoming();
  }, []);

  return { movies, status, mode, search, reload };
}
