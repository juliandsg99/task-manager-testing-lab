import React from 'react';
import { measureRenders } from 'reassure';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';

// ============================================================================
// MÉTRICA 2: FPS DE ANIMACIONES (proxy)
// ============================================================================
//
// Reassure no mide FPS reales — eso requiere un profiler nativo corriendo la
// app en un dispositivo o emulador de verdad (ej. Flashlight, Xcode
// Instruments, el Perf Monitor de React Native), y ninguna de esas
// herramientas está disponible en este entorno (ver limitaciones en el
// informe de rendimiento).
//
// Lo que sí podemos medir de forma confiable: el costo de RENDERIZAR el
// componente que dispara una animación. ConfirmDialog usa
// <Modal animationType="fade">, que el sistema operativo anima cada vez que
// `visible` pasa a true. La animación en sí la maneja el SO (no React), pero
// si el render de React que la acompaña (calcular clases de NativeWind,
// construir el árbol del diálogo) tarda más que el presupuesto de un frame,
// la animación puede arrancar con un salto visible en vez de empezar suave.
//
// Qué significa "rápido" acá, en concreto: que el render entre en el
// presupuesto de un frame a 60 FPS (~16.6 ms). Se miden dos escenarios por
// separado (diálogo oculto vs. visible, cada uno como su propio test) para
// que quede un registro identificable de cada uno en el reporte de
// Reassure; la comparación entre ambos (cuánto overhead agrega mostrarlo)
// se documenta en el informe de rendimiento, no acá.
const PRESUPUESTO_DE_UN_FRAME_A_60FPS_MS = 16.6;

const propsBase = {
  title: 'Eliminar reseña',
  message: '¿Seguro que quieres eliminar tu reseña? Esta acción no se puede deshacer.',
  confirmLabel: 'Eliminar',
  onConfirm: () => {},
  onCancel: () => {},
};

test('el render de ConfirmDialog oculto (sin animación) entra dentro del presupuesto de un frame a 60 FPS', async () => {
  const resultado = await measureRenders(<ConfirmDialog {...propsBase} visible={false} />);

  expect(resultado.meanDuration).toBeLessThan(PRESUPUESTO_DE_UN_FRAME_A_60FPS_MS);
});

test('el render de ConfirmDialog visible (dispara la animación fade del Modal) entra dentro del presupuesto de un frame a 60 FPS', async () => {
  const resultado = await measureRenders(<ConfirmDialog {...propsBase} visible={true} />);

  expect(resultado.meanDuration).toBeLessThan(PRESUPUESTO_DE_UN_FRAME_A_60FPS_MS);
});
