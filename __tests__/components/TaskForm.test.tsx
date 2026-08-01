import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskForm } from '../../src/components/TaskForm';

// TaskForm usa validateTaskTitle internamente para mostrar/ocultar un mensaje
// de error; estos tests cubren cada rama de esa validación y sus transiciones.
describe('TaskForm', () => {
  it('llama a onSubmit con el título ingresado al presionar "Guardar"', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.changeText(screen.getByTestId('input-titulo'), 'Mi nueva tarea');
    await fireEvent.press(screen.getByRole('button'));

    expect(mockOnSubmit).toHaveBeenCalledWith('Mi nueva tarea');
  });

  // Rama: título vacío -> validateTaskTitle devuelve 'El título es obligatorio'.
  it('muestra un mensaje de error y no llama a onSubmit si el campo está vacío', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByText('El título es obligatorio')).toBeTruthy();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Rama: título con menos de 3 caracteres -> mensaje de longitud mínima.
  it('muestra un mensaje de error si el título tiene menos de 3 caracteres', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.changeText(screen.getByTestId('input-titulo'), 'Ab');
    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByText('El título debe tener al menos 3 caracteres')).toBeTruthy();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Estado condicional: el error debe desaparecer apenas el usuario empieza a
  // corregir el campo, sin necesidad de volver a presionar "Guardar".
  it('oculta el mensaje de error una vez que el usuario corrige el título', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.press(screen.getByRole('button'));
    expect(screen.getByText('El título es obligatorio')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('input-titulo'), 'Título válido');

    expect(screen.queryByText('El título es obligatorio')).toBeNull();
  });

  // Camino feliz: con un título válido no debe quedar ningún mensaje de error visible.
  it('no muestra ningún mensaje de error al enviar un título válido', async () => {
    const mockOnSubmit = jest.fn();
    await render(<TaskForm onSubmit={mockOnSubmit} />);

    await fireEvent.changeText(screen.getByTestId('input-titulo'), 'Comprar leche');
    await fireEvent.press(screen.getByRole('button'));

    expect(screen.queryByText('El título es obligatorio')).toBeNull();
    expect(screen.queryByText('El título debe tener al menos 3 caracteres')).toBeNull();
    expect(mockOnSubmit).toHaveBeenCalledWith('Comprar leche');
  });
});
