import React from 'react';
import { renderRouter, screen, waitFor, act } from 'expo-router/testing-library';
import { Stack } from 'expo-router';
import { MovieListScreen } from '../../src/screens/MovieListScreen';

// MovieListScreen usa useFocusEffect (vía useReviewedMovieIds), que requiere
// un contexto de navegación real -> se monta a través del router de
// expo-router con un contexto en memoria mínimo, igual que en
// MovieListScreen.test.tsx (integración).
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

describe('MovieListScreen - Accesibilidad', () => {
  it('el campo de búsqueda tiene un rol de "search" y un accessibilityLabel descriptivo', async () => {
    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximos estrenos')).toBeTruthy();
    });

    const searchInput = screen.getByRole('search');
    expect(searchInput).toHaveProp('accessibilityRole', 'search');
    expect(searchInput).toHaveProp('accessibilityLabel', 'Buscar película');
  });

  it('el botón "Buscar" tiene accessibilityRole "button" y accessibilityLabel', async () => {
    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximos estrenos')).toBeTruthy();
    });

    const searchButton = screen.getByRole('button', { name: 'Buscar' });
    expect(searchButton).toHaveProp('accessibilityRole', 'button');
    expect(searchButton).toHaveProp('accessibilityLabel', 'Buscar');
  });

  it('los botones del filtro "Todas"/"Calificadas" son accesibles y describen su acción', async () => {
    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximos estrenos')).toBeTruthy();
    });

    const allFilter = screen.getByRole('button', { name: 'Mostrar todas las películas' });
    const reviewedFilter = screen.getByRole('button', {
      name: 'Mostrar solo películas que he calificado',
    });

    expect(allFilter).toHaveProp('accessibilityLabel', 'Mostrar todas las películas');
    expect(reviewedFilter).toHaveProp(
      'accessibilityLabel',
      'Mostrar solo películas que he calificado'
    );
  });

  it('el enlace para volver al inicio expone accessibilityRole "link" en vez de "button"', async () => {
    await renderMoviesScreen();
    await waitFor(() => {
      expect(screen.getByText('Próximos estrenos')).toBeTruthy();
    });

    const backLink = screen.getByRole('link', { name: 'Volver al inicio' });
    expect(backLink).toHaveProp('accessibilityRole', 'link');
  });
});
