import { useEffect, useState } from 'react';
import { deleteMovieReview, getMovieReview, saveMovieReview } from '../services/movieReviewService';
import { MovieReview } from '../types/movie';

// Carga la reseña propia (si existe) al entrar al detalle, y permite
// guardar una nueva calificación/comentario sobre esa misma película.
export function useMovieReview(movieId: number) {
  const [review, setReview] = useState<MovieReview | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Si falla la lectura de una reseña previa (ej. AsyncStorage no
  // disponible), se trata como "todavía no hay reseña" en vez de bloquear
  // el formulario: el usuario siempre debe poder calificar y comentar,
  // aunque no se haya podido recuperar una reseña anterior.
  const load = async () => {
    setStatus('loading');
    try {
      const stored = await getMovieReview(movieId);
      setReview(stored);
    } catch (err) {
      console.error('useMovieReview: no se pudo leer la reseña guardada', err);
      setReview(null);
    } finally {
      setStatus('success');
    }
  };

  useEffect(() => {
    load();
  }, [movieId]);

  const submit = async (rating: number, comment: string) => {
    try {
      const saved = await saveMovieReview(movieId, rating, comment);
      setReview(saved);
    } catch (err) {
      console.error('useMovieReview: no se pudo guardar la reseña', err);
      throw err;
    }
  };

  const remove = async () => {
    try {
      await deleteMovieReview(movieId);
      setReview(null);
    } catch (err) {
      console.error('useMovieReview: no se pudo eliminar la reseña', err);
      throw err;
    }
  };

  return { review, status, submit, remove };
}
