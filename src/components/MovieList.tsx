import React from 'react';
import { Text, FlatList } from 'react-native';
import { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieListProps {
  movies: Movie[];
  emptyMessage?: string;
}

// Lista de películas, análoga a TaskList: recibe el array ya resuelto y solo
// se encarga de renderizarlo (la carga/estados vive en useMovies/MovieListScreen).
// emptyMessage es configurable porque el mensaje difiere entre "sin próximos
// estrenos" y "sin resultados de búsqueda".
export function MovieList({ movies, emptyMessage = 'No hay películas para mostrar' }: MovieListProps) {
  if (movies.length === 0) {
    return <Text className="py-6 text-center text-base text-gray-500">{emptyMessage}</Text>;
  }

  return (
    <FlatList
      data={movies}
      keyExtractor={(m) => m.id.toString()}
      renderItem={({ item }) => <MovieCard movie={item} />}
    />
  );
}
