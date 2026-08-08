import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { ConfirmDialog } from './ConfirmDialog';
import { NoticeDialog } from './NoticeDialog';

const STARS = [1, 2, 3, 4, 5];

interface MovieReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

// Formulario de calificación (1 a 5 estrellas) + comentario libre para una
// película. initialRating/initialComment permiten precargar una reseña ya
// guardada para poder editarla; el componente asume que el padre solo lo
// renderiza una vez que esos valores iniciales están listos (ver
// MovieDetailScreen, que espera a que useMovieReview termine de cargar).
//
// "locked" representa el modo solo-lectura de una reseña ya guardada: se
// activa automáticamente al guardar (o si ya había una reseña al montar) y
// se desactiva con "Editar". Mientras está locked, ni las estrellas ni el
// comentario se pueden modificar.
//
// La confirmación de borrado y el aviso de guardado usan ConfirmDialog/
// NoticeDialog (mismo estilo que ConfirmDeleteDialog) en vez de Alert.alert,
// para que se vean y comporten igual en todas las plataformas. El aviso de
// "reseña eliminada" NO vive aquí: lo muestra MovieDetailScreen, porque justo
// después de un borrado exitoso este formulario se remonta en blanco (via key
// en el padre) y ese remount destruiría cualquier estado seteado aquí mismo.
export function MovieReviewForm({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onDelete,
}: MovieReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(initialRating > 0);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const handleRatingChange = (value: number) => {
    if (locked) return;
    setRating(value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Selecciona una calificación');
      return;
    }
    setError(null);
    try {
      await onSubmit(rating, comment);
      setLocked(true);
      setNotice({ title: 'Reseña guardada', message: 'Tu reseña se guardó correctamente.' });
    } catch {
      setError('No se pudo guardar la reseña, intenta de nuevo');
    }
  };

  const handleEdit = () => {
    setLocked(false);
    setError(null);
  };

  const runDelete = async () => {
    setConfirmingDelete(false);
    if (!onDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setError('No se pudo eliminar la reseña, intenta de nuevo');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View className="gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <Text className="text-base font-semibold text-gray-900">Tu reseña</Text>
      <View className="flex-row gap-1">
        {STARS.map((star) => (
          <Pressable
            key={star}
            onPress={() => handleRatingChange(star)}
            disabled={locked}
            accessibilityRole="button"
            accessibilityLabel={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
          >
            <Text className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
              ★
            </Text>
          </Pressable>
        ))}
      </View>
      {error && <Text className="text-sm font-medium text-red-600">{error}</Text>}
      <TextInput
        testID="input-comentario"
        placeholder="Escribe un comentario (opcional)"
        placeholderTextColor="#9ca3af"
        value={comment}
        onChangeText={setComment}
        editable={!locked}
        multiline
        numberOfLines={3}
        accessibilityLabel="Comentario sobre la película"
        className={`rounded-lg border px-4 py-3 text-base ${
          locked ? 'border-gray-200 bg-gray-100 text-gray-500' : 'border-gray-300 bg-white text-gray-900'
        }`}
      />
      {locked ? (
        <Pressable
          onPress={handleEdit}
          accessibilityRole="button"
          accessibilityLabel="Editar reseña"
          className="flex-row items-center justify-center gap-2 rounded-lg bg-gray-800 py-3 shadow-sm active:bg-gray-900"
        >
          <Text className="text-lg">✏️</Text>
          <Text className="text-base font-semibold text-white">Editar reseña</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Guardar reseña"
          className="flex-row items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 shadow-sm active:bg-blue-700"
        >
          <Text className="text-lg">💾</Text>
          <Text className="text-base font-semibold text-white">Guardar reseña</Text>
        </Pressable>
      )}
      {onDelete && initialRating > 0 && (
        <Pressable
          onPress={() => setConfirmingDelete(true)}
          disabled={deleting}
          accessibilityRole="button"
          accessibilityLabel="Eliminar reseña"
          className="flex-row items-center justify-center gap-2 rounded-lg bg-red-600 py-3 shadow-sm active:bg-red-700"
        >
          <Text className="text-lg">🗑️</Text>
          <Text className="text-base font-semibold text-white">
            {deleting ? 'Eliminando...' : 'Eliminar reseña'}
          </Text>
        </Pressable>
      )}

      <ConfirmDialog
        visible={confirmingDelete}
        title="Eliminar reseña"
        message="¿Seguro que quieres eliminar tu reseña? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={runDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
      <NoticeDialog
        visible={notice !== null}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        onClose={() => setNotice(null)}
      />
    </View>
  );
}
