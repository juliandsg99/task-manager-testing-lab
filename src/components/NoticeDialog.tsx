import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

interface NoticeDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

// Pop-up de aviso de un solo botón ("Aceptar"), con el mismo estilo que
// ConfirmDeleteDialog/ConfirmDialog, para notificaciones puntuales (ej.
// "reseña guardada", "reseña eliminada") en vez de un simple texto en pantalla.
export function NoticeDialog({ visible, title, message, onClose }: NoticeDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 p-6">
        <View className="w-full max-w-sm rounded-xl bg-white p-5">
          <Text className="text-lg font-bold text-gray-900">{title}</Text>
          <Text className="mt-2 text-sm text-gray-600">{message}</Text>
          <View className="mt-5 flex-row justify-end">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Aceptar"
              className="rounded-lg bg-blue-600 px-4 py-2 active:bg-blue-700"
            >
              <Text className="text-base font-semibold text-white">Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
