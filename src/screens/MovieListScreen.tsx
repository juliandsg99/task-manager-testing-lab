import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MovieList } from '../components/MovieList';
import { useMovies } from '../hooks/useMovies';
import { useReviewedMovieIds } from '../hooks/useReviewedMovieIds';
import { useReviewedMovies } from '../hooks/useReviewedMovies';

type ReviewFilter = 'all' | 'reviewed';

// Pantalla de próximos estrenos / búsqueda: delega la carga en useMovies y
// solo renderiza según status/mode (loading/error/success, upcoming/search),
// igual que CreateTaskScreen. El filtro "Calificadas" NO filtra el listado
// actual (upcoming/search) — reemplaza la vista por completo con
// useReviewedMovies, que trae todas las películas calificadas por su id, sin
// importar si están o no en la lista de próximos estrenos o en la búsqueda.
export function MovieListScreen() {
  const { movies, status, mode, search, reload } = useMovies();
  const reviewedIds = useReviewedMovieIds();
  const reviewedMovies = useReviewedMovies(reviewedIds);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ReviewFilter>('all');

  const clearSearch = () => {
    setQuery('');
    search('');
  };

  const isReviewedFilter = filter === 'reviewed';
  const visibleMovies = isReviewedFilter ? reviewedMovies.movies : movies;
  const visibleStatus = isReviewedFilter ? reviewedMovies.status : status;
  const handleReload = isReviewedFilter ? reviewedMovies.reload : reload;

  const title = isReviewedFilter
    ? 'Películas calificadas'
    : mode === 'search'
      ? 'Resultados de búsqueda'
      : 'Próximos estrenos';

  const emptyMessage = isReviewedFilter
    ? 'Todavía no has calificado ninguna película'
    : mode === 'search'
      ? 'No se encontraron películas para tu búsqueda'
      : undefined;

  return (
    <View
      className="flex-1 gap-4 bg-gray-50 p-4"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      <Link href="/" asChild>
        <Pressable accessibilityRole="link" accessibilityLabel="Volver al inicio">
          <Text className="text-sm font-medium text-blue-600">← Volver al inicio</Text>
        </Pressable>
      </Link>
      <Text className="text-2xl font-bold text-gray-900">{title}</Text>
      <View className="flex-row gap-2">
        <TextInput
          testID="input-busqueda"
          placeholder="Buscar película..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => search(query)}
          accessibilityRole="search"
          accessibilityLabel="Buscar película"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
        />
        <Pressable
          onPress={() => search(query)}
          accessibilityRole="button"
          accessibilityLabel="Buscar"
          className="items-center justify-center rounded-lg bg-blue-600 px-4 active:bg-blue-700"
        >
          <Text className="text-base font-semibold text-white">Buscar</Text>
        </Pressable>
      </View>
      {mode === 'search' && !isReviewedFilter && (
        <Pressable onPress={clearSearch} accessibilityRole="button" accessibilityLabel="Ver próximos estrenos">
          <Text className="text-sm font-medium text-blue-600">Ver próximos estrenos</Text>
        </Pressable>
      )}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setFilter('all')}
          accessibilityRole="button"
          accessibilityLabel="Mostrar todas las películas"
          className={`flex-1 items-center rounded-lg py-2 ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <Text className={`text-sm font-medium ${filter === 'all' ? 'text-white' : 'text-gray-700'}`}>
            Todas
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter('reviewed')}
          accessibilityRole="button"
          accessibilityLabel="Mostrar solo películas que he calificado"
          className={`flex-1 items-center rounded-lg py-2 ${filter === 'reviewed' ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <Text className={`text-sm font-medium ${filter === 'reviewed' ? 'text-white' : 'text-gray-700'}`}>
            Calificadas
          </Text>
        </Pressable>
      </View>
      {visibleStatus === 'loading' && <ActivityIndicator accessibilityLabel="Cargando películas" />}
      {visibleStatus === 'error' && (
        <View className="gap-2 rounded-lg bg-red-100 px-4 py-3">
          <Text className="text-sm font-medium text-red-800">Error al obtener las películas</Text>
          {/* handleReload reintenta el fetch correspondiente al filtro activo:
              upcoming/search (useMovies) o el detalle de cada calificada (useReviewedMovies) */}
          <Pressable onPress={handleReload} accessibilityRole="button" accessibilityLabel="Reintentar">
            <Text className="text-sm font-semibold text-red-800 underline">Reintentar</Text>
          </Pressable>
        </View>
      )}
      {visibleStatus === 'success' && <MovieList movies={visibleMovies} emptyMessage={emptyMessage} />}
    </View>
  );
}
