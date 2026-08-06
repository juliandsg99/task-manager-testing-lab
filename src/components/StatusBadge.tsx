import { Pressable, Text } from "react-native";

interface StatusBadgeProps {
  status: 'completed' | 'pending';
  onPress?: () => void;
}

export function StatusBadge({ status, onPress }: StatusBadgeProps) {
  const label = status === 'completed' ? 'Completada' : 'Pendiente';
  const icon = status === 'completed' ? '✓' : '○';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Estado: ${label}`}
      onPress={onPress}
    >
      <Text>{icon} {label}</Text>
    </Pressable>
  );
}