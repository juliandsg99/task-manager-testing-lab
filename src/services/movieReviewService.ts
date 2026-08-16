import AsyncStorage from '@react-native-async-storage/async-storage';
import { MovieReview } from '../types/movie';

// Todas las reseñas se guardan bajo una sola clave, como un mapa
// { [movieId]: MovieReview }, para evitar múltiples llamadas a AsyncStorage
// al listar/leer distintas películas.
const STORAGE_KEY = 'movieReviews';

async function getAllReviews(): Promise<Record<string, MovieReview>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function getMovieReview(movieId: number): Promise<MovieReview | null> {
  const all = await getAllReviews();
  return all[movieId] ?? null;
}

// Ids de todas las películas que ya tienen una reseña guardada, usado por el
// filtro "Calificadas" del listado (no se necesita el contenido de la
// reseña ahí, solo saber cuáles ya fueron calificadas).
export async function getReviewedMovieIds(): Promise<number[]> {
  const all = await getAllReviews();
  return Object.keys(all).map(Number);
}

export async function saveMovieReview(
  movieId: number,
  rating: number,
  comment: string
): Promise<MovieReview> {
  const review: MovieReview = { rating, comment, updatedAt: new Date().toISOString() };
  const all = await getAllReviews();
  all[movieId] = review;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return review;
}

export async function deleteMovieReview(movieId: number): Promise<void> {
  const all = await getAllReviews();
  delete all[movieId];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
