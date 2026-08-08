import { http, HttpResponse } from 'msw';

const API_URL = 'https://api.themoviedb.org/3';

// Handlers por defecto para el módulo de películas (TMDB). MSW ignora la
// query string al matchear por path, así que no hace falta declarar
// api_key/language/page acá: cualquier request a estas rutas cae en estos
// handlers salvo que un test los sobreescriba con server.use() (ver
// MovieListScreen.test.tsx para los casos de error/datos vacíos).
export const movieHandlers = [
  http.get(`${API_URL}/movie/upcoming`, () => {
    return HttpResponse.json({
      page: 1,
      results: [
        {
          id: 1,
          title: 'Próximo Estreno Uno',
          overview: 'Sinopsis del primer próximo estreno.',
          poster_path: '/poster1.jpg',
          release_date: '2026-09-01',
          vote_average: 7.5,
          vote_count: 100,
        },
        {
          id: 2,
          title: 'Próximo Estreno Dos',
          overview: 'Sinopsis del segundo próximo estreno.',
          poster_path: null,
          release_date: '2026-10-15',
          vote_average: 6.2,
          vote_count: 50,
        },
      ],
      total_pages: 1,
      total_results: 2,
    });
  }),

  http.get(`${API_URL}/search/movie`, () => {
    return HttpResponse.json({
      page: 1,
      results: [
        {
          id: 3,
          title: 'Resultado De Búsqueda',
          overview: 'Sinopsis del resultado de búsqueda.',
          poster_path: null,
          release_date: '2025-01-01',
          vote_average: 8.1,
          vote_count: 200,
        },
      ],
      total_pages: 1,
      total_results: 1,
    });
  }),

  // Patrones con :id van después de los literales de arriba (/movie/upcoming),
  // que si no también los interceptarían al matchear "upcoming" como :id.
  http.get(`${API_URL}/movie/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      title: 'Película de Prueba',
      overview: 'Sinopsis de la película de prueba.',
      poster_path: null,
      release_date: '2026-01-01',
      vote_average: 7.0,
      vote_count: 10,
      genres: [{ id: 1, name: 'Acción' }],
      runtime: 120,
      tagline: 'Una gran película',
    });
  }),

  http.get(`${API_URL}/movie/:id/videos`, ({ params }) => {
    return HttpResponse.json({ id: Number(params.id), results: [] });
  }),
];
