# Plan del equipo

> **Regla de los TA:** solo se puede avanzar hasta el CP3. El CP4 y el CP5 se trabajan recién después de
> aprobar la inspección. Las carpetas `src/features/news` y `src/features/sagas` son placeholders vacíos:
> no se escribe nada ahí hasta tener el Log Pose.

## Fase 1 · Hasta aprobar el CP3

CP1 y CP2 ya están en `main`. Ahora el trabajo es que funcionen con la API real y que los tres podamos
explicarlos: **el inspector elige quién responde**.

| Quién | Tarea | En la inspección domina |
|:------|:------|:------------------------|
| Sebastián | Probar CP1 y CP2 con la API real y corregir bugs | Todo (y se lo explica a los demás) |
| Camila | Registrar la tripulación oficial en Swagger. Probar los pasos 1–3 y 9 del guion | CP1 (`docs/CP3-GUIA.md`, sección CP1) |
| Ariana | Completar `README.md` y `hackathon.json`. Probar los pasos 4–8 del guion | CP2 (`docs/CP3-GUIA.md`, sección CP2) |
| Los 3 | Ronda cruzada: cada uno explica la parte del otro, sin mirar el código | CP1 + CP2 |

Pedimos la inspección cuando:

- [ ] `npm run build` pasa sin errores.
- [ ] El guion completo de la demo funciona con la API real y la cuenta oficial.
- [ ] Cada uno respondió dos preguntas de la guía sin ayuda.

## Fase 2 · Después de aprobar (con Log Pose)

| Quién | Checkpoint | Carpeta |
|:------|:-----------|:--------|
| Camila | CP4 · News Coo | `src/features/news` |
| Ariana | CP5 · Poneglyph | `src/features/sagas` |
| Sebastián | Apoyo, revisión y entrega final | — |

Las rutas ya están registradas en `src/router.tsx`: no hace falta tocar el router para empezar.

## Reglas

1. Solo editas tu carpeta. Si necesitas tocar algo compartido (`src/types/api.ts`, `src/router.tsx`,
   `src/components/ui`), avisa en el grupo antes.
2. Rama por checkpoint (`feat/cp4-news`, `feat/cp5-sagas`). Merge a `main` seguido.
3. Antes de cada push: `npm run build` sin errores. Sin `any` (descuenta 2 puntos).
4. Todo sale de la API real: datos hardcodeados invalidan la entrega.
5. Nunca subir la contraseña de la tripulación al repo. Se comparte por privado.

## Lo que ya existe para usar

| Qué | Dónde | Para qué |
|:----|:------|:---------|
| `apiRequest<T>(path, { query, signal, method, body })` | `src/lib/api.ts` | Toda llamada a la API. Ya agrega el token y normaliza errores. |
| `ApiError` (`status`, `code`, `message`, `details`) | `src/lib/api.ts` | Un solo formato de error. `code === 'LOG_POSE_REQUIRED'` es el 423. |
| `useApi(fetcher, deps)` | `src/hooks/useApi.ts` | Fetch con loading/error/reload y protección contra respuestas viejas. |
| Tipos de toda la API | `src/types/api.ts` | `NewsFeed`, `NewsDetail`, `SagaStory`, enums como `NEWS_TYPES`, etc. |
| `Spinner`, `ErrorState`, `EmptyState` | `src/components/ui` | Estados de loading, error con reintento y vacío. |

Ejemplo:

```tsx
const feed = useApi(
  (signal) => apiRequest<NewsFeed>('/news/feed', { query: { limit: 20, type }, signal }),
  [type],
)
```
