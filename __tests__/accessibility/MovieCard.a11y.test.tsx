import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MovieCard } from '../../src/components/MovieCard';

const movie = {
  id: 1,
  title: 'La Llegada',
  overview: 'Sinopsis de prueba.',
  poster_path: '/poster.jpg',
  release_date: '2026-01-01',
  vote_average: 7.5,
  vote_count: 10,
};

describe('MovieCard - Accesibilidad', () => {
  it('la tarjeta completa es accesible con un accessibilityLabel descriptivo', async () => {
    await render(<MovieCard movie={movie} />);

    // El Pressable declara accessibilityRole="button", pero al estar envuelto
    // en <Link asChild> expo-router agrega su propio prop `role="link"` sobre
    // el mismo elemento; React Native Testing Library resuelve el rol
    // consultable priorizando `role` por sobre `accessibilityRole`, así que el
    // rol efectivo que "ve" un lector de pantalla es "link", no "button".
    const card = screen.getByRole('link', { name: 'Ver detalle de La Llegada' });
    expect(card).toHaveProp('accessibilityRole', 'button');
    expect(card).toHaveProp('accessibilityLabel', 'Ver detalle de La Llegada');
  });

  it('el póster tiene un accessibilityLabel que identifica a qué película pertenece', async () => {
    await render(<MovieCard movie={movie} />);

    const poster = screen.getByLabelText('Póster de La Llegada');
    expect(poster).toHaveProp('accessibilityLabel', 'Póster de La Llegada');
  });

  it('sin póster (poster_path null), no queda ninguna imagen con accessibilityLabel roto', async () => {
    await render(<MovieCard movie={{ ...movie, poster_path: null }} />);

    // No debe existir un accessibilityLabel de póster "colgado" apuntando a
    // una imagen que no se está renderizando; en su lugar se muestra el
    // placeholder de texto "Sin póster".
    expect(screen.queryByLabelText('Póster de La Llegada')).toBeNull();
    expect(screen.getByText('Sin póster')).toBeTruthy();
  });
});
