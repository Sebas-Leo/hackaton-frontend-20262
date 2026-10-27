# CP5 — Poneglyph (Ariana)

## Rutas y comportamiento

- `/sagas`: consulta el resumen real con `GET /sagas`.
- `/sagas/:id`: consulta `GET /sagas/{id}/story`.
- `/sagas/:id?stage=<slug>` abre una etapa concreta. Un slug inválido se normaliza a la primera etapa.
- Desplazarse actualiza la etapa, mapa, ruta recorrida, isla, paleta, métricas, progreso y URL. Los cambios por scroll reemplazan la entrada actual del historial para no llenarlo.
- La URL conserva otros parámetros. Cambiar de etapa no vuelve a descargar la historia.
- En escritorio el mapa permanece al lado de la narrativa; en móvil permanece arriba. Se mide el encabezado de la aplicación para no tapar la etapa seleccionada.
- Se puede avanzar con Anterior/Siguiente, el selector o los puntos del mapa. Al navegar a un capítulo recibe el foco; las flechas, Inicio y Fin permiten cambiar de etapa desde ese foco.
- Toda la narrativa continúa en el documento, también con movimiento reducido o sin soporte de animaciones.
- CSS `animation-timeline: view()` se activa solo si existe soporte y no se solicita movimiento reducido. En los demás casos, el mismo contenido y la navegación funcionan con scroll normal.
- React Router utiliza View Transition API al entrar o volver al resumen cuando el navegador la ofrece y no se solicita movimiento reducido. En otros navegadores usa navegación normal.

## Archivos

- `SagasPage.tsx`: resumen y enlaces a historias.
- `SagaStoryPage.tsx`: narrativa, etapas, métricas y controles.
- `useStoryNavigation.ts`: etapa activa por scroll, enlaces directos, teclado y URL.
- `SagaMap.tsx`: mapa SVG con coordenadas de la API, ruta y barco en la isla activa.
- `saga-utils.ts`: paletas, preferencia de movimiento reducido y detección de View Transition API.
- `SagaError.tsx`: error con reintento, saga no encontrada y bloqueo por Log Pose.
- `sagas.css`: diseño adaptable y animaciones con mejora progresiva.

## Datos y acceso

No hay narrativa, islas, coordenadas, métricas ni sagas de ejemplo en el código de la aplicación. Todo llega desde la API, usando la URL base configurada y la sesión existente. El frontend respeta el 423 del servidor; no simula una aprobación del CP3.

## Verificación realizada

- Compilación de producción y TypeScript estricto: sin errores.
- Linter del proyecto: sin errores; permanecen dos avisos previos fuera de esta carpeta.
- Pruebas de integración ejecutadas fuera del repositorio con ejemplos del Swagger: resumen, enlace directo a etapa, mapa y progreso, botones y foco, flechas, actualización por scroll, slug inválido, contenido completo con preferencia de movimiento reducido, 423, error con reintento, lista vacía, historia vacía y saga inexistente.
- La simulación de tamaño móvil de esas pruebas comprueba comportamiento y contenido; no sustituye una revisión visual de diseño en un navegador real.
- Con la sesión oficial de TEAM-002 se verificó el estado de bloqueo real. Al momento de la prueba, el backend todavía respondió `LOG_POSE_REQUIRED`. La prueba visual de las historias reales queda pendiente de la aprobación del CP3.

## Prueba después de desbloquear el Log Pose

1. Abrir `/sagas`, entrar a una historia y desplazarse por sus etapas: isla, métricas y URL deben coincidir.
2. Copiar una URL con `stage`, recargarla y abrirla en otra pestaña: debe llevar a esa etapa.
3. Probar Anterior/Siguiente, el selector, Tab/Enter en el mapa y flechas desde el capítulo enfocado.
4. Probar escritorio y móvil y activar movimiento reducido: debe seguir disponible la historia completa.
5. Volver al resumen y abrir otra saga. Probar también un identificador y un slug inexistentes.
