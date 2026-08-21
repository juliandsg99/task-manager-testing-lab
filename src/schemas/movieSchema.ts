import { z } from 'zod';

// Contrato de una película individual, tal como la devuelve TMDB en sus
// endpoints de listado (GET /movie/upcoming, GET /search/movie). Solo se
// incluyen los campos que la app realmente usa (ver src/types/movie.ts) —
// TMDB devuelve muchos más (adult, genre_ids, original_language, etc.), y
// no hace falta validarlos si la UI nunca los lee.
export const MovieSchema = z.object({
  // TMDB usa ids numéricos, no strings (a diferencia de las tareas locales,
  // que usan Date.now().toString()). Confundir uno con otro es un error
  // común al tipar a mano; el esquema lo detecta automáticamente.
  id: z.number(),
  // min(1): un título vacío pasaría un chequeo de "es string" pero no
  // sirve para mostrar en la UI ni para buscar por texto.
  title: z.string().min(1),
  overview: z.string(),
  // nullable() (no optional()): TMDB siempre incluye la clave "poster_path"
  // en la respuesta, pero su valor es null cuando no hay póster cargado
  // para esa película. Si se usara optional() acá, una respuesta real con
  // poster_path: null fallaría la validación por error.
  poster_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
});

// Contrato de la respuesta completa de GET /movie/upcoming (y de
// /search/movie, que devuelve el mismo sobre). No es solo un array de
// películas: TMDB pagina los resultados, así que hay que validar también
// que venga la metadata de paginación con los tipos correctos.
export const MoviesResponseSchema = z.object({
  page: z.number(),
  results: z.array(MovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

// z.infer deriva el tipo de TypeScript directamente del esquema de Zod, así
// el tipo y la validación en runtime nunca se desincronizan entre sí (a
// diferencia de mantener una interface de TypeScript a mano por separado).
export type Movie = z.infer<typeof MovieSchema>;
export type MoviesResponse = z.infer<typeof MoviesResponseSchema>;
