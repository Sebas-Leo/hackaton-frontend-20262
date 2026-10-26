# Plan del equipo

## División (por carpeta, para no pisarnos)

| Quién | Checkpoint | Carpeta que es SUYA | Depende de |
|:------|:-----------|:--------------------|:-----------|
| Sebastián | Base + CP1 (listo) + CP2 | `src/auth`, `src/lib`, `src/hooks`, `src/components`, `src/pages`, `src/features/wanted` | nada |
| Camila | CP4 · News Coo | `src/features/news` | base (ya está en `main`) |
| Ariana | CP5 · Poneglyph | `src/features/sagas` | base (ya está en `main`) |
| Los 3 | CP3 · Inspección | — | CP1 + CP2 funcionando |

Por qué así: CP1 + CP2 son el camino crítico hacia el CP3 (sin Log Pose, CP4 y CP5 valen 0). Al estar en un
solo carril, CP4 y CP5 no esperan a nadie: se construyen desde el minuto 0 con las respuestas de ejemplo de
Swagger y se conectan a la API real cuando aprobemos el CP3.

## Reglas

1. Solo editas tu carpeta. Si necesitas tocar algo compartido (`src/types/api.ts`, `src/router.tsx`,
   `src/components/ui`), avisa en el grupo antes.
2. Las rutas ya están registradas en `src/router.tsx`. No hace falta tocar el router para empezar.
3. Rama por checkpoint: `feat/cp4-news`, `feat/cp5-sagas`. Merge a `main` seguido (cada ~20 min).
4. Antes de cada push: `npm run build` sin errores. Sin `any` (descuenta 2 puntos).
5. Datos de ejemplo de Swagger solo mientras no tengamos Log Pose. Antes de las 2:00 **todo** debe venir de la
   API real (datos hardcodeados invalidan la entrega).
6. Nunca subir la contraseña de la tripulación al repo.

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

## Primeros 10 minutos

- [ ] Una persona registra la tripulación oficial en Swagger (`POST /auth/register`) y comparte email y
      contraseña por privado. Esa es la cuenta para pedir el CP3.
- [ ] Cada una: `git pull`, `npm install`, `npm run dev`, login con la cuenta oficial.
- [ ] Leer en Swagger los endpoints de su checkpoint.

## CP3: todas tenemos que poder explicar CP1 y CP2

El inspector elige quién responde. Antes de pedir la inspección hacemos una pasada de 10 minutos con
`docs/CP3-GUIA.md`.
