import { MovieSchema, MoviesResponseSchema } from '../../src/schemas/movieSchema';

// Pruebas de contrato: no verifican lógica de la app, sino que la FORMA de
// los datos que devuelve (o podría devolver) la API de TMDB coincide con lo
// que src/schemas/movieSchema.ts espera. Si TMDB cambiara un tipo de campo
// sin avisar, estas pruebas son las que lo detectarían — no un test de
// componente, que solo prueba con datos ya bien formados.
describe('API Contract - Películas (GET /movie/upcoming)', () => {
  // --- Casos válidos ---------------------------------------------------

  it('la respuesta de GET /movie/upcoming cumple con el esquema esperado', () => {
    const apiResponse = {
      page: 1,
      results: [
        {
          id: 969681,
          title: 'Spider-Man: Brand New Day',
          overview: 'Fighting crime full-time as Spider-Man...',
          poster_path: '/iPOn6DinuVyLY17YM9mKuPofV08.jpg',
          release_date: '2026-07-29',
          vote_average: 7.916,
          vote_count: 1108,
        },
        {
          id: 2,
          title: 'Otro Estreno',
          overview: 'Sinopsis de otra película.',
          poster_path: null,
          release_date: '2026-10-15',
          vote_average: 6.2,
          vote_count: 50,
        },
      ],
      total_pages: 1,
      total_results: 2,
    };

    const result = MoviesResponseSchema.safeParse(apiResponse);

    expect(result.success).toBe(true);
  });

  it('acepta poster_path en null (TMDB no siempre tiene póster cargado)', () => {
    const movieSinPoster = {
      id: 3,
      title: 'Película sin póster',
      overview: 'Sinopsis.',
      poster_path: null,
      release_date: '2026-01-01',
      vote_average: 5,
      vote_count: 1,
    };

    const result = MovieSchema.safeParse(movieSinPoster);

    expect(result.success).toBe(true);
  });

  it('acepta una respuesta paginada sin resultados (results: [])', () => {
    // Caso límite real: en algún momento del año puede no haber próximos
    // estrenos que TMDB tenga cargados. Un array vacío es una respuesta
    // válida, no un error — la UI ya maneja este caso mostrando "No hay
    // películas para mostrar" (ver MovieList.tsx), y el contrato no debería
    // rechazar algo que la app sabe manejar.
    const respuestaSinResultados = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    };

    const result = MoviesResponseSchema.safeParse(respuestaSinResultados);

    expect(result.success).toBe(true);
  });

  it('tolera campos adicionales que la app no usa, sin romper el contrato', () => {
    // TMDB devuelve muchos más campos de los que src/types/movie.ts declara
    // (adult, genre_ids, original_language, video, etc. — ver el ejemplo
    // real de la API en la conversación que originó este módulo). El
    // esquema solo define los campos que la app necesita; por defecto Zod
    // ignora las claves no declaradas en vez de fallar. Esto es a propósito:
    // si TMDB agrega un campo nuevo mañana, esta prueba (y la app) no deben
    // romperse solo por eso.
    const respuestaConCamposExtra = {
      id: 969681,
      title: 'Spider-Man: Brand New Day',
      overview: 'Sinopsis.',
      poster_path: '/poster.jpg',
      release_date: '2026-07-29',
      vote_average: 7.916,
      vote_count: 1108,
      adult: false,
      genre_ids: [878, 28, 12],
      original_language: 'en',
      video: false,
    };

    const result = MovieSchema.safeParse(respuestaConCamposExtra);

    expect(result.success).toBe(true);
  });

  // --- Casos inválidos ---------------------------------------------------

  it('detecta cuando la API devuelve un campo con tipo incorrecto (id como string)', () => {
    // Este es el caso que más importa detectar: TMDB usa ids numéricos, pero
    // si algún día la API (o un mock, o un cambio de versión) empezara a
    // mandar el id como string, cualquier código que compare ids con `===`
    // number fallaría silenciosamente en producción. El contrato lo
    // atrapa acá, antes de que llegue a la UI.
    const invalidResponse = {
      id: '969681', // debería ser number, no string
      title: 'Spider-Man: Brand New Day',
      overview: 'Sinopsis.',
      poster_path: '/poster.jpg',
      release_date: '2026-07-29',
      vote_average: 7.916,
      vote_count: 1108,
    };

    const result = MovieSchema.safeParse(invalidResponse);

    expect(result.success).toBe(false);
  });

  it('detecta cuando la API omite un campo requerido (falta title)', () => {
    const incompleteResponse = {
      id: 969681,
      overview: 'Sinopsis.',
      poster_path: null,
      release_date: '2026-07-29',
      vote_average: 7.916,
      vote_count: 1108,
    };

    const result = MovieSchema.safeParse(incompleteResponse);

    expect(result.success).toBe(false);
  });

  it('detecta un título vacío como inválido, aunque sea del tipo correcto', () => {
    // Un string vacío pasa cualquier chequeo de "es string", pero no
    // representa una película real — por eso el esquema exige min(1), no
    // solo z.string(). Esta prueba verifica esa regla puntual, no solo el
    // tipo de dato.
    const tituloVacio = {
      id: 4,
      title: '',
      overview: 'Sinopsis.',
      poster_path: null,
      release_date: '2026-01-01',
      vote_average: 5,
      vote_count: 1,
    };

    const result = MovieSchema.safeParse(tituloVacio);

    expect(result.success).toBe(false);
  });

  it('detecta cuando la respuesta paginada no trae "results" como array', () => {
    const invalidPaginatedResponse = {
      page: 1,
      results: { id: 1, title: 'Esto debería ser un array, no un objeto' },
      total_pages: 1,
      total_results: 1,
    };

    const result = MoviesResponseSchema.safeParse(invalidPaginatedResponse);

    expect(result.success).toBe(false);
  });

  it('detecta cuando "page" viene con un tipo incorrecto en el sobre de paginación', () => {
    // No alcanza con validar cada película: el sobre que las contiene
    // (page/total_pages/total_results) también es parte del contrato, y
    // useMovies depende de esa metadata para decidir si hay más páginas.
    const paginaComoString = {
      page: '1', // debería ser number
      results: [],
      total_pages: 1,
      total_results: 0,
    };

    const result = MoviesResponseSchema.safeParse(paginaComoString);

    expect(result.success).toBe(false);
  });
});
