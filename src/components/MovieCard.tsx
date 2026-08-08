import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Movie } from '../types/movie';

// TMDB no sirve las imágenes directamente: poster_path es solo un sufijo
// (ej. "/abc.jpg") que hay que combinar con esta base y un tamaño ("w342").
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342';

interface MovieCardProps {
  movie: Movie;
}

// Tarjeta de una sola película: póster (o placeholder si no hay), título,
// fecha de estreno, calificación y sinopsis truncada. Toda la tarjeta es un
// Link hacia /movies/[id] para ver el detalle completo.
export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={{ pathname: '/movies/[id]', params: { id: String(movie.id) } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${movie.title}`}
        className="mb-3 flex-row gap-3 rounded-lg border border-gray-200 bg-white p-3"
      >
        {movie.poster_path ? (
          <Image
            source={{ uri: `${POSTER_BASE_URL}${movie.poster_path}` }}
            accessibilityLabel={`Póster de ${movie.title}`}
            className="h-32 w-20 rounded-md bg-gray-100"
          />
        ) : (
          // Placeholder para películas sin póster registrado en TMDB.
          <View className="h-32 w-20 items-center justify-center rounded-md bg-gray-100">
            <Text className="text-center text-xs text-gray-400">Sin póster</Text>
          </View>
        )}
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-gray-900">{movie.title}</Text>
          <Text className="text-xs text-gray-500">
            {movie.release_date} · ★ {movie.vote_average.toFixed(1)}
          </Text>
          {/* numberOfLines evita que sinopsis largas rompan el layout de la tarjeta */}
          <Text className="text-sm text-gray-600" numberOfLines={3}>
            {movie.overview || 'Sin sinopsis disponible'}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
