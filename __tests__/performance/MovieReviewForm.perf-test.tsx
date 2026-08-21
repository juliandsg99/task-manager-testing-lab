import React from 'react';
import { measureRenders } from 'reassure';
import { MovieReviewForm } from '../../src/components/MovieReviewForm';

// ============================================================================
// Complementa la MÉTRICA 2 (FPS de animaciones / fluidez): costo de un
// componente con más lógica condicional y dos <Modal> siempre en el árbol
// ============================================================================
//
// MovieReviewForm es el componente más "pesado" del módulo de películas:
// tiene varios estados (bloqueado/editable, error, eliminando) y monta
// siempre dos <Modal> (ConfirmDialog/NoticeDialog), aunque estén con
// visible={false}. En el informe de rendimiento se lo compara contra otros
// componentes más simples (~0.7-0.8 ms de media) para mostrar que ese costo
// extra (los Modal, las clases condicionales) pesa de verdad (~1.3 ms, casi
// el doble) — esa comparación relativa vive en el informe, no en este
// archivo, porque Reassure no soporta comparar dos mediciones dentro de un
// mismo test de forma nativa.
//
// Qué significa "rápido" acá: igual que en los otros archivos, que el
// render entre en el presupuesto de un frame a 60 FPS (~16.6 ms). Este
// umbral es una cota de seguridad absoluta, no reemplaza el seguimiento de
// regresiones real: para eso está `reassure --baseline` (compara esta rama
// contra otra, ej. main, y avisa si algo empeoró aunque siga por debajo del
// umbral).
//
// Nota: no se agregó un `scenario` con fireEvent (calificar con estrellas,
// escribir un comentario) porque en este entorno los `scenario` con
// interacción no funcionan de forma confiable con Reassure — ver la nota
// completa en el informe de rendimiento. El mount simple sí es estable y es
// la métrica que se reporta acá.
const PRESUPUESTO_DE_UN_FRAME_A_60FPS_MS = 16.6;

test('el render de MovieReviewForm al montarse (con sus dos Modal ocultos) entra dentro del presupuesto de un frame a 60 FPS', async () => {
  const resultado = await measureRenders(<MovieReviewForm onSubmit={jest.fn()} />);

  expect(resultado.meanDuration).toBeLessThan(PRESUPUESTO_DE_UN_FRAME_A_60FPS_MS);
});
