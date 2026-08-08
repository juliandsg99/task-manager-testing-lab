import { MovieDetail, MovieVideo, MoviesResponse, MovieVideosResponse } from '../types/movie';

const API_URL = 'https://api.themoviedb.org/3';
// El prefijo EXPO_PUBLIC_ hace que Expo inyecte esta variable en el bundle del
// cliente. El valor real se define en un archivo .env local (no versionado);
// ver .env.example para la variable esperada.
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

// Consulta los próximos estrenos según TMDB. page=1 trae solo la primera
// página; no se implementa paginación porque la pantalla actual muestra un
// único listado simple.
export async function fetchUpcomingMovies(): Promise<MoviesResponse> {
  const res = await fetch(
    `${API_URL}/movie/upcoming?language=es-MX&page=1&api_key=${API_KEY}`
  );
  if (!res.ok) throw new Error('Error al obtener las películas');
  return res.json();
}

// Búsqueda por título usando el endpoint de TMDB para eso (distinto del de
// listados: no acepta un "query" vacío, por eso se valida en el hook antes
// de llamar a esta función).
export async function searchMovies(query: string): Promise<MoviesResponse> {
  const res = await fetch(
    `${API_URL}/search/movie?language=es-ES&page=1&query=${encodeURIComponent(query)}&api_key=${API_KEY}`
  );
  if (!res.ok) throw new Error('Error al buscar películas');
  return res.json();
}

// Detalle de una película puntual (para la pantalla que se abre al tocar
// una tarjeta). Devuelve más campos que el listado (genres, runtime, tagline).
export async function fetchMovieDetail(id: number): Promise<MovieDetail> {
  const res = await fetch(`${API_URL}/movie/${id}?language=es-ES&api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Error al obtener el detalle de la película');
  return res.json();
}

// No se filtra por language: la mayoría de los tráilers subidos a YouTube
// están etiquetados en inglés y con language=es-ES suele venir un array vacío.
export async function fetchMovieVideos(id: number): Promise<MovieVideosResponse> {
  const res = await fetch(`${API_URL}/movie/${id}/videos?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Error al obtener los videos de la película');
  return res.json();
}

// De todos los videos devueltos por TMDB, se prioriza un tráiler oficial de
// YouTube; si no hay, cualquier tráiler de YouTube; si no hay ninguno, null
// (la UI simplemente no muestra el botón de tráiler).
export function findYoutubeTrailerKey(videos: MovieVideo[]): string | null {
  const trailer =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
    videos.find((v) => v.site === 'YouTube');
  return trailer?.key ?? null;
}
