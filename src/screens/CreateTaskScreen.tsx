import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { useCreateTask } from '../hooks/useCreateTask';

export function CreateTaskScreen() {
  const { status, tasks, submit, removeTask } = useCreateTask();
  const insets = useSafeAreaInsets();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const pendingTask = tasks.find((t) => t.id === pendingDelete);

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
      <Text className="text-2xl font-bold text-gray-900">Nueva tarea</Text>
      <TaskForm onSubmit={submit} />
      {status === 'success' && (
        <Text className="rounded-lg bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
          Tarea creada exitosamente
        </Text>
      )}
      {status === 'error' && (
        <Text className="rounded-lg bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
          Error al crear la tarea
        </Text>
      )}
      <TaskList tasks={tasks} onDelete={setPendingDelete} />
      <ConfirmDeleteDialog
        visible={pendingDelete !== null}
        taskTitle={pendingTask?.title}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeTask(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </View>
  );
}
