import { renderHook, act } from '@testing-library/react-native';
import { useCreateTask } from '../../src/hooks/useCreateTask';
import * as taskService from '../../src/services/taskService';

describe('useCreateTask', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('inicia con estado idle y sin tareas', async () => {
    const { result } = await renderHook(() => useCreateTask());

    expect(result.current.status).toBe('idle');
    expect(result.current.tasks).toEqual([]);
  });

  it('crea una tarea correctamente y actualiza el estado a success', async () => {
    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Comprar leche');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Comprar leche');
    expect(result.current.tasks[0].status).toBe('pending');
  });

  // Verifica el orden de inserción: las tareas nuevas deben quedar primero en la lista.
  it('agrega las tareas nuevas al inicio de la lista', async () => {
    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea 1');
    });
    await act(async () => {
      await result.current.submit('Tarea 2');
    });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks[0].title).toBe('Tarea 2');
    expect(result.current.tasks[1].title).toBe('Tarea 1');
  });

  // Se mockea taskService.createTask (única dependencia externa del hook) para
  // forzar el rechazo y así cubrir la rama catch -> status 'error'.
  it('establece el estado en error cuando createTask falla', async () => {
    jest.spyOn(taskService, 'createTask').mockRejectedValueOnce(new Error('falla simulada'));
    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea que fallará');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.tasks).toEqual([]);
  });

  it('elimina una tarea existente por su id', async () => {
    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea a eliminar');
    });
    const id = result.current.tasks[0].id;

    await act(async () => {
      result.current.removeTask(id);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  // Caso límite: removeTask usa filter, que no lanza si el id no existe.
  // Se documenta explícitamente que eliminar un id inexistente es un no-op seguro.
  it('no falla al intentar eliminar una tarea con un id inexistente', async () => {
    const { result } = await renderHook(() => useCreateTask());

    await act(async () => {
      await result.current.submit('Tarea existente');
    });

    await act(async () => {
      result.current.removeTask('id-que-no-existe');
    });

    expect(result.current.tasks).toHaveLength(1);
  });
});
