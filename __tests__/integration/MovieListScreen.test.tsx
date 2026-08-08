import React from 'react';
import { renderRouter, screen, waitFor, act, fireEvent } from 'expo-router/testing-library';
import { Stack } from 'expo-router';
import { http, HttpResponse } from 'msw';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { server } from '../../src/mocks/server';
import { MovieListScreen } from '../../src/screens/MovieListScreen';
import { saveMovieReview } from '../../src/services/movieReviewService';

const API_URL = 'https://api.themoviedb.org/3';

// MovieListScreen usa useFocusEffect (via useReviewedMovieIds), que requiere
// un contexto de navegación real -> no se puede renderizar de forma aislada
// con SafeAreaProvider como CreateTaskScreen. Se monta a través del router
// real de expo-router (renderRouter) con un contexto en memoria mínimo, para
// que useNavigation/useFocusEffect funcionen sin depender del árbol completo
// de app/ (que además importa global.css, que Jest no puede transformar).
function RootLayoutStub() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

async function renderMoviesScreen() {
  await act(async () => {
    renderRouter(
      {
        _layout: RootLayoutStub,
        'movies/index': MovieListScreen,
        'movies/[id]': () => null,
        index: () => null,
      },
      { initialUrl: '/movies' }
    );
  });
}

describe('MovieListScreen - Integración', () => {
  afterEach(async () => {
    // Las reseñas viven en AsyncStorage (mockeado en jest.setup.js); se limpia
    // entre tests para que no haya fugas de estado entre escenarios.
    await AsyncStorage.clear();
  });

  it('carga y muestra los próximos estrenos devueltos por la API al entrar a la pantalla', async () => {
    await renderMoviesScreen();

    await waitFor(() => {
      expect(screen.getByText('Próximos estrenos')).toBeTruthy();
    });
    expect(screen.getByText('Próximo Estreno Uno')).toBeTruthy();
    expect(screen.getByText('Próximo Estreno Dos')).toBeTruthy();
  });

  it('busca películas por título y muestra los resultados devueltos por la API', async () => {
    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximo Estreno Uno')).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('input-busqueda'), 'búsqueda');
    await fireEvent.press(screen.getByLabelText('Buscar'));

    await waitFor(() => {
      expect(screen.getByText('Resultados de búsqueda')).toBeTruthy();
    });
    expect(screen.getByText('Resultado De Búsqueda')).toBeTruthy();
    expect(screen.queryByText('Próximo Estreno Uno')).toBeNull();
  });

  it('muestra un mensaje de error cuando la API de búsqueda falla', async () => {
    server.use(
      http.get(`${API_URL}/search/movie`, () => {
        return HttpResponse.json({ status_message: 'Internal error' }, { status: 500 });
      })
    );

    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximo Estreno Uno')).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('input-busqueda'), 'lo que sea');
    await fireEvent.press(screen.getByLabelText('Buscar'));

    await waitFor(() => {
      expect(screen.getByText('Error al obtener las películas')).toBeTruthy();
    });
    expect(screen.getByLabelText('Reintentar')).toBeTruthy();
  });

  it('muestra un mensaje de "sin resultados" cuando la búsqueda no devuelve películas', async () => {
    server.use(
      http.get(`${API_URL}/search/movie`, () => {
        return HttpResponse.json({ page: 1, results: [], total_pages: 1, total_results: 0 });
      })
    );

    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximo Estreno Uno')).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('input-busqueda'), 'película inexistente');
    await fireEvent.press(screen.getByLabelText('Buscar'));

    await waitFor(() => {
      expect(screen.getByText('No se encontraron películas para tu búsqueda')).toBeTruthy();
    });
  });

  it('el filtro "Calificadas" muestra una película calificada aunque no esté en los próximos estrenos', async () => {
    // Película calificada que NO forma parte de los próximos estrenos
    // mockeados (esos son los ids 1 y 2); useReviewedMovies debe traerla por
    // su propio id vía GET /movie/:id, sin depender del listado actual.
    await saveMovieReview(99, 5, 'Excelente');

    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximo Estreno Uno')).toBeTruthy();
    });

    await fireEvent.press(screen.getByLabelText('Mostrar solo películas que he calificado'));

    await waitFor(() => {
      expect(screen.getByText('Películas calificadas')).toBeTruthy();
    });
    expect(screen.getByText('Película de Prueba')).toBeTruthy();
    expect(screen.queryByText('Próximo Estreno Uno')).toBeNull();
  });
});
