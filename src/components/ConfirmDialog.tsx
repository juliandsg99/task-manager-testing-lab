import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Versión genérica/parametrizable de ConfirmDeleteDialog (mismo look & feel:
// Modal centrado, tarjeta blanca redondeada, overlay oscuro), pero sin texto
// hardcodeado a "tarea" para poder reutilizarla en otros flujos de confirmación
// (ej. eliminar una reseña de película).
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/40 p-6">
        <View className="w-full max-w-sm rounded-xl bg-white p-5">
          <Text className="text-lg font-bold text-gray-900">{title}</Text>
          <Text className="mt-2 text-sm text-gray-600">{message}</Text>
          <View className="mt-5 flex-row justify-end gap-3">
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              className="rounded-lg px-4 py-2 active:bg-gray-100"
            >
              <Text className="text-base font-medium text-gray-600">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              className="rounded-lg bg-red-600 px-4 py-2 active:bg-red-700"
            >
              <Text className="text-base font-semibold text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
