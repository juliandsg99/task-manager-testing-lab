// Subconjunto de los campos que devuelve la API de TMDB para cada película
// (solo se incluyen los que realmente se usan en la UI).
export interface Movie {
  id: number;
  title: string;
  overview: string;
  // poster_path puede ser null si TMDB no tiene póster para esa película.
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

// Forma de la respuesta paginada que devuelven los endpoints de listado de TMDB
// (ej. /movie/upcoming, /search/movie), no solo el array de resultados.
export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieGenre {
  id: number;
  name: string;
}

// El endpoint de detalle (/movie/{id}) devuelve todos los campos de Movie más
// estos adicionales (genres en vez de genre_ids, runtime, tagline).
export interface MovieDetail extends Movie {
  genres: MovieGenre[];
  runtime: number | null;
  tagline: string;
}

// Resultado del endpoint /movie/{id}/videos. TMDB agrega ahí tráilers,
// teasers, clips, etc. de distintos sitios (YouTube, Vimeo); solo interesan
// los de tipo Trailer en YouTube para el botón "Ver tráiler".
export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieVideosResponse {
  id: number;
  results: MovieVideo[];
}

// Reseña propia del usuario para una película, guardada solo en el
// dispositivo (TMDB no soporta comentarios de texto vía API pública).
export interface MovieReview {
  rating: number; // 1 a 5 estrellas
  comment: string;
  updatedAt: string;
}
