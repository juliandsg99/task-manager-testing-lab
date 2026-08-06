import React, { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { validateTaskTitle } from '../utils/validateTask';

interface TaskFormProps {
  onSubmit: (title: string) => void;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChangeText = (value: string) => {
    setTitle(value);
    if (error) setError(null);
  };

  const handleSubmit = () => {
    const validationError = validateTaskTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(title);
  };

  return (
    <View className="gap-3">
      <TextInput
        testID="input-titulo"
        placeholder="Escribe el título de la tarea"
        placeholderTextColor="#9ca3af"
        value={title}
        onChangeText={handleChangeText}
        accessibilityLabel="Título de la tarea"
        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
      />
      {error && (
        <Text className="text-sm font-medium text-red-600" accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Pressable
        onPress={handleSubmit}
        accessibilityRole="button"
        className="rounded-lg bg-blue-600 py-3 active:bg-blue-700"
      >
        <Text className="text-center text-base font-semibold text-white">Guardar</Text>
      </Pressable>
    </View>
  );
}
