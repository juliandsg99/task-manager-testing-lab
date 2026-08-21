import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { measureRenders } from 'reassure';
import { HomeScreen } from '../../src/screens/HomeScreen';

// ============================================================================
// MÉTRICA 1: TIEMPO DE ARRANQUE (proxy)
// ============================================================================
//
// Reassure no puede medir el arranque completo de la app: eso incluye la
// carga del proceso nativo, la inicialización de módulos nativos y la
// descarga/interpretación del bundle de JavaScript — todo esto ocurre ANTES
// de que exista un árbol de React para medir, así que ninguna herramienta
// que mida "renders" (como Reassure) puede verlo.
//
// Lo que SÍ podemos medir de forma confiable con las herramientas de React
// Native es el costo de renderizar la PRIMERA pantalla que ve el usuario
// (HomeScreen) apenas el motor de JavaScript toma control. Esa parte del
// arranque sí depende de nuestro código (cuántos componentes, cuánta lógica
// en el primer render) y es la que realmente podemos optimizar desde acá.
//
// Se usa como "proxy" (aproximación razonable) de tiempo de arranque, no
// como el tiempo de arranque real de punta a punta.
//
// Qué significa "rápido" acá, en concreto: que el render se resuelva dentro
// del presupuesto de un solo frame a 60 FPS (~16.6 ms). No es un número
// arbitrario — es el margen por debajo del cual el usuario percibe la
// pantalla como instantánea; por encima, empieza a sentirse una demora. Sin
// un número así, "renderiza rápido" es una afirmación que el test nunca
// verifica de verdad.
const PRESUPUESTO_DE_UN_FRAME_A_60FPS_MS = 16.6;

// HomeScreen usa useSafeAreaInsets, que requiere un SafeAreaProvider real en
// el árbol o lanza un error; se simulan las medidas de un iPhone típico.
const medidasSimuladas = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function ConProveedorDeAreaSegura({ children }: { children: React.ReactNode }) {
  return <SafeAreaProvider initialMetrics={medidasSimuladas}>{children}</SafeAreaProvider>;
}

test('el render de HomeScreen (pantalla inicial) entra dentro del presupuesto de un frame a 60 FPS', async () => {
  const resultado = await measureRenders(<HomeScreen />, { wrapper: ConProveedorDeAreaSegura });

  expect(resultado.meanDuration).toBeLessThan(PRESUPUESTO_DE_UN_FRAME_A_60FPS_MS);
});
