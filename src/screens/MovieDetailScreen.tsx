import React, { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { useMovieReview } from '../hooks/useMovieReview';
import { MovieReviewForm } from '../components/MovieReviewForm';
import { NoticeDialog } from '../components/NoticeDialog';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Pantalla de detalle, accesible al tocar una MovieCard. El id llega como
// parámetro de la ruta dinámica /movies/[id] (definida en app/movies/[id].tsx).
export function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = Number(id);
  const { movie, trailerKey, status, reload } = useMovieDetail(movieId);
  const { review, status: reviewStatus, submit: submitReview, remove: removeReview } =
    useMovieReview(movieId);
  const insets = useSafeAreaInsets();
  // Cambia solo al eliminar una reseña, para forzar que MovieReviewForm se
  // remonte con initialRating/initialComment en blanco (ver comentario junto
  // al <MovieReviewForm> más abajo).
  const [formResetKey, setFormResetKey] = useState(0);
  // El aviso de "reseña eliminada" vive aquí (no dentro de MovieReviewForm)
  // porque justo después de eliminar se cambia formResetKey para remontar el
  // formulario en blanco; si el aviso se seteara dentro del propio formulario,
  // ese remount lo destruiría antes de que llegara a mostrarse.
  const [showDeletedNotice, setShowDeletedNotice] = useState(false);

  const openTrailer = () => {
    if (trailerKey) Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`);
  };

  const handleDeleteReview = async () => {
    await removeReview();
    setFormResetKey((key) => key + 1);
    setShowDeletedNotice(true);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View
        className="gap-4 p-4"
        style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
      >
        <Link href="/movies" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Volver a la lista de películas">
            <Text className="text-sm font-medium text-blue-600">← Volver a la lista</Text>
          </Pressable>
        </Link>

        {status === 'loading' && <ActivityIndicator accessibilityLabel="Cargando película" />}

        {status === 'error' && (
          <View className="gap-2 rounded-lg bg-red-100 px-4 py-3">
            <Text className="text-sm font-medium text-red-800">Error al obtener la película</Text>
            <Pressable onPress={reload} accessibilityRole="button" accessibilityLabel="Reintentar">
              <Text className="text-sm font-semibold text-red-800 underline">Reintentar</Text>
            </Pressable>
          </View>
        )}

        {status === 'success' && movie && (
          <View className="gap-3">
            {movie.poster_path ? (
              <Image
                source={{ uri: `${POSTER_BASE_URL}${movie.poster_path}` }}
                accessibilityLabel={`Póster de ${movie.title}`}
                className="h-96 w-full rounded-lg bg-gray-100"
                resizeMode="cover"
              />
            ) : null}
            <Text className="text-2xl font-bold text-gray-900">{movie.title}</Text>
            {movie.tagline ? (
              <Text className="text-sm italic text-gray-500">{movie.tagline}</Text>
            ) : null}
            {trailerKey && (
              <Pressable
                onPress={openTrailer}
                accessibilityRole="link"
                accessibilityLabel={`Ver tráiler de ${movie.title}`}
                className="items-center rounded-lg bg-red-600 py-3 active:bg-red-700"
              >
                <Text className="text-base font-semibold text-white">▶ Ver tráiler</Text>
              </Pressable>
            )}
            <Text className="text-sm text-gray-500">
              {movie.release_date} · ★ {movie.vote_average.toFixed(1)}
              {movie.runtime ? ` · ${movie.runtime} min` : ''}
            </Text>
            {movie.genres.length > 0 && (
              <Text className="text-sm text-gray-500">
                {movie.genres.map((g) => g.name).join(', ')}
              </Text>
            )}
            <Text className="text-base text-gray-700">
              {movie.overview || 'Sin sinopsis disponible'}
            </Text>
            {/* Se espera a que la reseña guardada (si existe) termine de cargar
                antes de montar el formulario, para que sus valores iniciales
                reflejen lo que ya había guardado el usuario. key=formResetKey
                fuerza un remount tras eliminar, para que vuelva a quedar en
                blanco (initialRating/initialComment solo se leen al montar). */}
            {reviewStatus === 'success' && (
              <MovieReviewForm
                key={formResetKey}
                initialRating={review?.rating ?? 0}
                initialComment={review?.comment ?? ''}
                onSubmit={submitReview}
                onDelete={handleDeleteReview}
              />
            )}
            <NoticeDialog
              visible={showDeletedNotice}
              title="Reseña eliminada"
              message="Tu reseña se eliminó correctamente."
              onClose={() => setShowDeletedNotice(false)}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
