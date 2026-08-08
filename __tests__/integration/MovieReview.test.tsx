import React from 'react';
import { renderRouter, screen, waitFor, act, fireEvent } from 'expo-router/testing-library';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MovieDetailScreen } from '../../src/screens/MovieDetailScreen';
import { getMovieReview, saveMovieReview } from '../../src/services/movieReviewService';

const MOVIE_ID = 42;

// Igual que en MovieListScreen.test.tsx: se necesita un router real (no
// SafeAreaProvider aislado) porque el árbol usa hooks dependientes de
// navegación en otras pantallas del módulo; se mantiene el mismo patrón de
// contexto en memoria por consistencia y para no arrastrar app/_layout.tsx
// (que importa global.css, que Jest no transforma).
function RootLayoutStub() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

async function renderMovieDetail(movieId: number) {
  await act(async () => {
    renderRouter(
      {
        _layout: RootLayoutStub,
        'movies/[id]': MovieDetailScreen,
        'movies/index': () => null,
        index: () => null,
      },
      { initialUrl: `/movies/${movieId}` }
    );
  });
}

describe('Reseñas de películas - Integración', () => {
  afterEach(async () => {
    // Las reseñas viven en AsyncStorage (mockeado en jest.setup.js); se limpia
    // entre tests para que no haya fugas de estado entre escenarios.
    await AsyncStorage.clear();
  });

  it('crea una reseña nueva: el usuario califica, comenta, guarda y queda persistida', async () => {
    await renderMovieDetail(MOVIE_ID);

    await waitFor(() => {
      expect(screen.getByText('Tu reseña')).toBeTruthy();
    });

    // Sin reseña previa: el formulario arranca desbloqueado y sin guardar.
    expect(screen.getByLabelText('Guardar reseña')).toBeTruthy();
    expect(screen.queryByLabelText('Editar reseña')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Calificar con 4 estrellas'));
    await fireEvent.changeText(
      screen.getByTestId('input-comentario'),
      'Muy buena película, la recomiendo.'
    );
    await fireEvent.press(screen.getByLabelText('Guardar reseña'));

    await waitFor(() => {
      expect(screen.getByText('Reseña guardada')).toBeTruthy();
    });
    await fireEvent.press(screen.getByLabelText('Aceptar'));

    // Tras guardar, el formulario queda bloqueado (modo solo lectura).
    await waitFor(() => {
      expect(screen.getByLabelText('Editar reseña')).toBeTruthy();
    });
    expect(screen.getByTestId('input-comentario').props.editable).toBe(false);

    const stored = await getMovieReview(MOVIE_ID);
    expect(stored?.rating).toBe(4);
    expect(stored?.comment).toBe('Muy buena película, la recomiendo.');
  });

  it('edita una reseña existente: desbloquea, cambia calificación/comentario y persiste el cambio', async () => {
    await saveMovieReview(MOVIE_ID, 3, 'Comentario original');

    await renderMovieDetail(MOVIE_ID);

    await waitFor(() => {
      expect(screen.getByLabelText('Editar reseña')).toBeTruthy();
    });
    // Con una reseña ya guardada, el formulario arranca bloqueado.
    expect(screen.getByTestId('input-comentario').props.editable).toBe(false);

    await fireEvent.press(screen.getByLabelText('Editar reseña'));

    await waitFor(() => {
      expect(screen.getByLabelText('Guardar reseña')).toBeTruthy();
    });
    await fireEvent.press(screen.getByLabelText('Calificar con 5 estrellas'));
    await fireEvent.changeText(screen.getByTestId('input-comentario'), 'Comentario editado');
    await fireEvent.press(screen.getByLabelText('Guardar reseña'));

    await waitFor(() => {
      expect(screen.getByText('Reseña guardada')).toBeTruthy();
    });
    await fireEvent.press(screen.getByLabelText('Aceptar'));

    const stored = await getMovieReview(MOVIE_ID);
    expect(stored?.rating).toBe(5);
    expect(stored?.comment).toBe('Comentario editado');
  });

  it('elimina una reseña existente: confirma en el diálogo, avisa y deja el formulario en blanco', async () => {
    await saveMovieReview(MOVIE_ID, 2, 'Para eliminar');

    await renderMovieDetail(MOVIE_ID);

    await waitFor(() => {
      expect(screen.getByLabelText('Eliminar reseña')).toBeTruthy();
    });

    await fireEvent.press(screen.getByLabelText('Eliminar reseña'));

    await waitFor(() => {
      expect(screen.getByText('¿Seguro que quieres eliminar tu reseña? Esta acción no se puede deshacer.')).toBeTruthy();
    });
    await fireEvent.press(screen.getByLabelText('Eliminar'));

    await waitFor(() => {
      expect(screen.getByText('Reseña eliminada')).toBeTruthy();
    });
    await fireEvent.press(screen.getByLabelText('Aceptar'));

    // El formulario se remonta en blanco: vuelve a mostrar "Guardar reseña"
    // y ya no hay botón de eliminar porque no queda ninguna reseña guardada.
    await waitFor(() => {
      expect(screen.getByLabelText('Guardar reseña')).toBeTruthy();
    });
    expect(screen.queryByLabelText('Eliminar reseña')).toBeNull();

    const stored = await getMovieReview(MOVIE_ID);
    expect(stored).toBeNull();
  });

  it('cancela la eliminación desde el diálogo de confirmación y conserva la reseña', async () => {
    await saveMovieReview(MOVIE_ID, 1, 'No borrar');

    await renderMovieDetail(MOVIE_ID);
    await waitFor(() => {
      expect(screen.getByLabelText('Eliminar reseña')).toBeTruthy();
    });

    await fireEvent.press(screen.getByLabelText('Eliminar reseña'));
    await waitFor(() => {
      expect(screen.getByLabelText('Cancelar')).toBeTruthy();
    });
    await fireEvent.press(screen.getByLabelText('Cancelar'));

    expect(screen.queryByText('Reseña eliminada')).toBeNull();
    expect(screen.getByLabelText('Eliminar reseña')).toBeTruthy();

    const stored = await getMovieReview(MOVIE_ID);
    expect(stored?.comment).toBe('No borrar');
  });
});
