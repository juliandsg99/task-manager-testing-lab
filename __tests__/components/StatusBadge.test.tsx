import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StatusBadge } from '../../src/components/StatusBadge';

describe('StatusBadge', () => {
  // Rama: status === 'completed' -> icono "✓" y label "Completada".
  it('muestra el estado "✓ Completada" correctamente', async () => {
    await render(<StatusBadge status="completed" />);
    expect(screen.getByText('✓ Completada')).toBeTruthy();
  });

  // Rama: status === 'pending' -> icono "○" y label "Pendiente".
  it('muestra el estado "○ Pendiente" correctamente', async () => {
    await render(<StatusBadge status="pending" />);
    expect(screen.getByText('○ Pendiente')).toBeTruthy();
  });

  // La accessibilityLabel debe reflejar el estado actual, no un texto fijo.
  it('expone una accessibilityLabel acorde al estado mostrado', async () => {
    await render(<StatusBadge status="completed" />);
    expect(screen.getByRole('button', { name: 'Estado: Completada' })).toBeTruthy();
  });

  // El badge es interactivo: al presionarlo debe invocar el callback recibido por props.
  it('llama a onPress al presionar el badge', async () => {
    const mockOnPress = jest.fn();
    await render(<StatusBadge status="pending" onPress={mockOnPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  // onPress es opcional: presionar el badge sin haberlo provisto no debe romper
  // el componente (uso de solo-lectura, ej. dentro de una lista).
  it('no falla al presionar el badge si no se recibe onPress', async () => {
    await render(<StatusBadge status="pending" />);

    expect(() => fireEvent.press(screen.getByRole('button'))).not.toThrow();
  });

  // Estado condicional: StatusBadge no tiene estado interno, es puramente
  // controlado por la prop status, así que se verifica vía rerender.
  it('actualiza el texto mostrado cuando cambia el status recibido', async () => {
    const { rerender } = await render(<StatusBadge status="pending" />);
    expect(screen.getByText('○ Pendiente')).toBeTruthy();

    await rerender(<StatusBadge status="completed" />);

    expect(screen.queryByText('○ Pendiente')).toBeNull();
    expect(screen.getByText('✓ Completada')).toBeTruthy();
  });
});
