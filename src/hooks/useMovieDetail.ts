import { useEffect, useState } from 'react';
import { fetchMovieDetail, fetchMovieVideos, findYoutubeTrailerKey } from '../services/movieService';
import { MovieDetail } from '../types/movie';

// Análogo a useMovies pero para una sola película, identificada por id
// (viene del parámetro de ruta /movies/[id]).
export function useMovieDetail(id: number) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const load = async () => {
    setStatus('loading');
    setTrailerKey(null);
    try {
      const detail = await fetchMovieDetail(id);
      setMovie(detail);
      setStatus('success');
    } catch {
      setStatus('error');
      return;
    }

    // El tráiler se busca aparte: si esta llamada falla, no debe tumbar el
    // detalle que ya se cargó correctamente, solo omitir el botón de tráiler.
    try {
      const videos = await fetchMovieVideos(id);
      setTrailerKey(findYoutubeTrailerKey(videos.results));
    } catch {
      setTrailerKey(null);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return { movie, trailerKey, status, reload: load };
}
