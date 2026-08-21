import React from 'react';
import { render, cleanup, act } from '@testing-library/react-native';
import { MovieCard } from '../../src/components/MovieCard';

// ============================================================================
// MÉTRICA 3: USO DE MEMORIA (aproximado)
// ============================================================================
//
// Esto NO es una medición de memoria nativa real (el RSS del proceso en un
// dispositivo o emulador, que es lo que reportarían Flashlight o Instruments
// — no disponibles en este entorno, ver limitaciones en el informe). Es una
// aproximación con `process.memoryUsage()` de Node: cuánto crece el heap de
// JavaScript al montar y desmontar el mismo componente muchas veces seguidas.
//
// Por qué igual sirve: si el heap NO vuelve a bajar cerca de su nivel
// original después de desmontar y forzar el recolector de basura, es una
// señal de una fuga de memoria real (listeners no removidos, timers vivos,
// referencias que quedan colgadas) — algo que, si existiera, también se
// notaría como crecimiento de memoria nativa en un dispositivo real.
//
// Limitación importante: el recolector de basura de V8 (el motor de
// JavaScript que usa Node/Jest) no es determinístico y no se comporta igual
// que Hermes (el motor que corre en el dispositivo real). Estos números son
// direccionales — sirven para detectar una fuga grosera, no para calcular
// el consumo de memoria exacto de la app.
//
// Este test no usa `measureRenders` de Reassure (esa API mide duración de
// render, no memoria) — es un test de Jest "a mano" que igual vive en esta
// carpeta porque mide una de las 3 métricas de rendimiento pedidas.

const pelicula = {
  id: 1,
  title: 'Película de Prueba',
  overview: 'Sinopsis de prueba para el test de memoria.',
  poster_path: '/poster.jpg',
  release_date: '2026-01-01',
  vote_average: 7.5,
  vote_count: 10,
};

const CANTIDAD_DE_CICLOS = 50;
// Umbral generoso a propósito: el objetivo es detectar una fuga clara
// (crecimiento sostenido de varias decenas de MB), no exigir 0 bytes de
// diferencia, que no es realista ni siquiera sin fugas reales.
const CRECIMIENTO_MAXIMO_ACEPTABLE_MB = 20;

function forzarRecoleccionDeBasuraSiEstaDisponible() {
  // `global.gc` solo existe si Node corre con --expose-gc. Si no está
  // disponible, el test igual corre, pero el resultado tiene más ruido
  // porque no podemos forzar la limpieza del heap antes de medir.
  if (typeof global.gc === 'function') {
    global.gc();
  }
}

function aMegabytes(bytes: number) {
  return bytes / 1024 / 1024;
}

test('montar y desmontar MovieCard muchas veces no deja creciendo la memoria de forma sostenida', async () => {
  forzarRecoleccionDeBasuraSiEstaDisponible();
  const heapAntes = process.memoryUsage().heapUsed;

  for (let i = 0; i < CANTIDAD_DE_CICLOS; i += 1) {
    const { unmount } = await render(<MovieCard movie={pelicula} />);
    await act(async () => {
      unmount();
    });
  }
  cleanup();
  forzarRecoleccionDeBasuraSiEstaDisponible();

  const heapDespues = process.memoryUsage().heapUsed;
  const crecimientoMB = aMegabytes(heapDespues - heapAntes);

  console.log(
    `[Uso de memoria] heap antes: ${aMegabytes(heapAntes).toFixed(2)} MB · ` +
      `heap después de ${CANTIDAD_DE_CICLOS} ciclos de montar/desmontar: ${aMegabytes(heapDespues).toFixed(2)} MB · ` +
      `crecimiento: ${crecimientoMB.toFixed(2)} MB`
  );

  expect(crecimientoMB).toBeLessThan(CRECIMIENTO_MAXIMO_ACEPTABLE_MB);
});
