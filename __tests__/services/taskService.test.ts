import { fetchTasks, createTask } from '../../src/services/taskService';

// fetchTasks depende de la global fetch; se mockea para no golpear la red real
// y para forzar cada una de sus rutas de respuesta (éxito, error HTTP, fallo de red).
describe('fetchTasks', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('retorna las tareas cuando la respuesta es exitosa', async () => {
    const tareas = [
      { id: '1', title: 'Tarea 1', status: 'pending' },
      { id: '2', title: 'Tarea 2', status: 'completed' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(tareas),
    }) as unknown as typeof fetch;

    const result = await fetchTasks();

    expect(global.fetch).toHaveBeenCalledWith('https://api.taskmanager.com/tasks');
    expect(result).toEqual(tareas);
  });

  // Cubre la rama `if (!res.ok) throw ...` de fetchTasks.
  it('lanza un error cuando la respuesta no es exitosa', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn(),
    }) as unknown as typeof fetch;

    await expect(fetchTasks()).rejects.toThrow('Error al obtener las tareas');
  });

  // Caso límite: una API que responde ok pero sin datos no debería romper el flujo.
  it('retorna un array vacío cuando la API no tiene tareas', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    }) as unknown as typeof fetch;

    const result = await fetchTasks();

    expect(result).toEqual([]);
  });

  // Caso límite: fetch puede rechazar directamente (sin llegar a .ok) por problemas
  // de red/DNS/timeout; ese error debe propagarse tal cual, no ser silenciado.
  it('propaga el error cuando fetch falla por un problema de red', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

    await expect(fetchTasks()).rejects.toThrow('Network request failed');
  });
});

// createTask no tiene dependencias externas (es un mock local sin backend real),
// por lo que estos tests documentan su comportamiento actual, incluyendo que
// no realiza ninguna validación de título (eso es responsabilidad de validateTaskTitle).
describe('createTask', () => {
  it('crea una tarea con el título recibido y estado pending', async () => {
    const task = await createTask('Comprar leche');

    expect(task.title).toBe('Comprar leche');
    expect(task.status).toBe('pending');
    expect(typeof task.id).toBe('string');
  });

  // El id se genera con Date.now(); se mockea para verificar que dos creaciones
  // en momentos distintos produzcan ids distintos.
  it('genera ids distintos para tareas creadas en momentos diferentes', async () => {
    jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    const task1 = await createTask('Tarea 1');
    const task2 = await createTask('Tarea 2');

    expect(task1.id).not.toBe(task2.id);

    jest.restoreAllMocks();
  });

  // Caso límite: título vacío. Documenta que la validación no ocurre en este nivel.
  it('no valida el título: acepta un string vacío tal cual', async () => {
    const task = await createTask('');

    expect(task.title).toBe('');
    expect(task.status).toBe('pending');
  });

  // Caso límite: título de longitud extrema, para confirmar que no se trunca ni falla.
  it('acepta un título de longitud extrema sin truncarlo', async () => {
    const tituloLargo = 'A'.repeat(10000);

    const task = await createTask(tituloLargo);

    expect(task.title).toBe(tituloLargo);
    expect(task.title.length).toBe(10000);
  });
});
