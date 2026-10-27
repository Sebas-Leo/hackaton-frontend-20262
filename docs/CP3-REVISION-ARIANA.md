# Revisión de Ariana — guion CP3, pasos 4–8

Fecha: 26 de octubre de 2026 (Lima).
Tripulación: **hackaton-H2-2 · TEAM-002**.

## Resultado: pasos 4–8 verificados con la API real

Se usó la cuenta oficial ya autenticada. Para contar las peticiones se empleó un registro HTTP local temporal que reenviaba las solicitudes al backend real. Registró solamente método, ruta y estado HTTP; no guardó contraseñas, tokens, cabeceras de autorización ni cuerpos. Los datos no fueron simulados. La herramienta temporal no forma parte de la aplicación y se retiró al terminar.

| Paso | Resultado | Evidencia |
| --- | --- | --- |
| 4. Buscar ancla | PASÓ | Escribir `ancla` generó una sola petición con `q=ancla`, respuesta 200. La URL quedó `/wanted?q=ancla` y se mostraron dos carteles: Oriol Peña, Ancla Roja; Hiroshi Shimizu, Ancla Doble. |
| 5. Cambiar filtro desde página 3 | PASÓ | Se recorrieron las páginas 1, 2 y 3. Al seleccionar Capturado desde la página 3, la URL quedó `/wanted?status=CAPTURED`, la API recibió `page=0` y la vista mostró página 1 de 2. |
| 6. Compartir URL y atrás/adelante | PASÓ | Otra pestaña abierta con `/wanted?status=CAPTURED` mostró los mismos 20 enlaces a carteles. Agregar Zoan produjo `status=CAPTURED&fruit=ZOAN`. Atrás recuperó la URL y los carteles anteriores; adelante recuperó la combinación y sus carteles. |
| 7. URL inválida | PASÓ | `/wanted?page=99&size=7&status=XX` se corrigió a `/wanted?page=7`. El servidor recibió tamaño 20, sin estado inválido; tras consultar `page=98`, se solicitó `page=6`. La vista mostró página 7 de 7 con 17 carteles. |
| 8. Abrir/cerrar detalle | PASÓ | En página 7 se abrió el cartel de Kiyomi Beltrán y se cerró. Se conservó exactamente la URL y los 17 enlaces del listado. La posición vertical se conservó dentro de 2 px (redondeo del navegador: 1009.60 → 1011.20 px). En el registro solo apareció el GET del detalle; no hubo otra petición del listado al abrir o cerrar. |

Las peticiones del guion respondieron 200. Las cargas iniciales adicionales de desarrollo no se contaron como búsquedas: StrictMode puede repetir los efectos iniciales; el cambio de búsqueda produjo una única petición final.

## Explicaciones para la inspección

- Búsqueda: cada tecla reinicia un temporizador de 400 ms. Al terminar se actualiza `q` en la URL. Enter confirma de inmediato. Archivo: `src/features/wanted/SearchBox.tsx`.
- Página: cambiar un filtro reinicia `page` a 1; hacia la API se resta uno porque comienza en 0. Archivo: `src/features/wanted/useWantedParams.ts` y `wanted-params.ts`.
- URL: `useSearchParams` es la fuente de verdad. El parser valida cada valor y el serializador reconstruye la selección. Atrás/adelante recupera los parámetros del historial.
- Página fuera de rango: tras recibir `totalPages`, el listado corrige una página superior a la última existente. Solo usa una respuesta que corresponde a la búsqueda actual. Archivo: `src/features/wanted/WantedListPage.tsx`.
- Respuestas tardías: `useApi` aborta la petición anterior e ignora los resultados que no corresponden a los parámetros actuales. Archivo: `src/hooks/useApi.ts`.
- Detalle: es una ruta hija mostrada encima del listado; el listado continúa montado. Cerrar desde el listado vuelve a la entrada anterior del historial. Archivos: `src/router.tsx`, `WantedTable.tsx` y `WantedDetailPage.tsx`.

## Alcance

Esta revisión cubre los pasos 4–8 asignados a Ariana. No sustituye los pasos 1–3 y 9 ni la inspección presencial del CP3, que debe responder cada integrante sin IA.

README.md y hackathon.json contienen los nombres proporcionados, nombre de tripulación y TEAM_CODE. Los códigos universitarios siguen pendientes por indicación de Ariana.
