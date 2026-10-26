# Guía CP3 · Reverse Mountain

El inspector elige quién responde. Cada respuesta tiene que decir **qué problema hay**, **cómo lo
resolvimos** y **dónde está en el código**.

## Guion de la demo (~1.5 min)

1. Sin sesión, abrir `/wanted?status=CAPTURED&page=2` → manda a login → al entrar vuelve a esa URL exacta.
2. Recargar en `/dashboard` → se ve "Verificando sesión…", nunca el login.
3. Registro con un email ya usado → el error aparece debajo del campo Email.
4. En `/wanted`, escribir "ancla" con la pestaña Network abierta → **una** request.
5. Ir a la página 3 y cambiar un filtro → vuelve a la página 1.
6. Copiar la URL y abrirla en otra pestaña → mismo resultado. Atrás/adelante → mismo resultado.
7. Abrir `/wanted?page=99&size=7&status=XX` → no se rompe y la URL se corrige sola.
8. Abrir un cartel y cerrarlo → el listado sigue en la misma página, mismo scroll, sin recargar.
9. Logout. Abrir `/cualquier-cosa` → 404.

---

## CP1 · Zarpar

### Rutas privadas y volver a donde quería ir
- **Problema:** si alguien abre una ruta privada sin sesión hay que mandarlo al login, pero sin perder a
  dónde iba.
- **Solución:** `RequireAuth` envuelve todas las rutas privadas. Si no hay sesión hace
  `<Navigate to="/login" replace state={{ from: location }} />`. Al loguearse, `PublicOnly` redirige a
  `pathname + search + hash` guardado en `state`.
- **Dónde:** `src/auth/guards.tsx`, `src/auth/redirect.ts`.
- **¿Por qué `replace`?** Para que "atrás" no vuelva a la URL que te rebotó (bucle).
- **¿Por qué `state` y no `?redirect=`?** No ensucia la URL y no permite redirigir a otro dominio
  (`getRedirectTarget` solo arma rutas internas).

### Restaurar sesión sin mostrar el login
- **Problema:** al recargar, React arranca sin estado. Si mostramos el login mientras verificamos el token,
  parpadea.
- **Solución:** el token vive en `localStorage`. Si existe, el estado inicial es `checking` (no `anonymous`) y
  se muestra un splash mientras `GET /auth/me` confirma el token.
  - 200 → `authenticated`.
  - 401 → sesión inválida → login.
  - Error de red/5xx → pantalla con "Reintentar": no cerramos la sesión porque el servidor esté caído.
- **Dónde:** `src/auth/AuthProvider.tsx` (estado inicial y efecto de restore), `src/components/SessionSplash.tsx`.
- **¿Por qué no decodificar el JWT en el cliente?** No podemos verificar la firma y el token puede estar
  revocado. El servidor es la autoridad.

### La sesión deja de ser válida → login
- **Problema:** el token puede vencer en medio del uso.
- **Solución:** `apiRequest` detecta cualquier 401 enviado con token, borra el token y avisa a los
  suscriptores (patrón Observer). `AuthProvider` escucha y hace `logout('expired')`. Además hay un
  `setTimeout` que cierra la sesión justo en `expiresAt`.
- **Detalle fino:** solo invalida si el token rechazado sigue siendo el actual (un 401 tardío de un token
  viejo no tumba una sesión nueva).
- **Dónde:** `src/lib/api.ts` (`onUnauthorized`), `src/auth/AuthProvider.tsx`.

### Registro con errores del servidor junto al campo
- **Problema:** el servidor valida y responde `{ code, message, details[] }`; hay que mostrar cada error en
  su input.
- **Solución:** `mapApiErrorToForm` traduce `EMAIL_ALREADY_REGISTERED` → `email`,
  `TEAM_NAME_TAKEN` → `teamName` y cada `details[].field` → ese campo. El registro devuelve token, así que
  entra directo con sesión.
- **Dónde:** `src/lib/form-errors.ts`, `src/pages/RegisterPage.tsx`, `src/components/ui/Field.tsx`.

### Dashboard: loading, error con reintento y vacío
- **Solución:** `useApi` expone `status` (`loading | success | error`) y `reload()`. Summary y Log Pose son
  dos requests independientes: si una falla, la otra se muestra igual. Vacío = `wanted.total === 0` (lo dice
  el contrato).
- **¿Cómo funciona "Reintentar"?** `reload()` incrementa un `reloadKey` que está en las deps del efecto, y el
  efecto vuelve a correr.
- **Dónde:** `src/pages/DashboardPage.tsx`, `src/hooks/useApi.ts`.

### Logout y 404
- `logout('manual')` borra token y estado. Si fue manual, no guardamos `from`.
- 404: ruta comodín `path: '*'` en `src/router.tsx`.

---

## CP2 · Se Busca

### Estado completo en la URL
- **Problema:** recargar, compartir o usar atrás/adelante debe mostrar lo mismo.
- **Solución:** los filtros **no** viven en `useState`. La URL es la única fuente de verdad
  (`useSearchParams`). `parseWantedParams` (URL → objeto) y `serializeWantedParams` (objeto → URL). La vista
  es una función de la URL.
- `page` es 1 en la URL (para humanos) y 0 en la API (`toWantedQuery`).
- **Dónde:** `src/features/wanted/wanted-params.ts`, `src/features/wanted/useWantedParams.ts`.

### URL con valores inválidos
- **Problema:** `?size=999` o `?status=FOO` → el servidor responde 400 ("no adivina").
- **Solución:** el parser **nunca lanza**: cada parámetro se valida contra una lista blanca y si no es válido
  cae al default. `crewId` se valida contra `/crews` cuando carga. Después un efecto reescribe la URL con
  `replace` (no agrega entrada al historial).

### Nunca quedar en una página que no existe
- Dos mecanismos:
  1. Cualquier cambio de filtro, búsqueda, orden o tamaño resetea `page = 1` (`update` con
     `resetPage: true` por defecto).
  2. Clamp: si la respuesta dice `totalPages < page`, se reemplaza por la última página.
- **Bug que encontramos:** el clamp usaba los datos de la búsqueda anterior durante un render. Lo
  arreglamos etiquetando cada respuesta con las deps que la pidieron (ver siguiente punto).

### Búsqueda sin una request por tecla (debounce)
- **Solución:** `SearchBox` guarda lo que escribes en estado local. Cada tecla reinicia un `setTimeout` de
  400 ms; solo cuando dejas de escribir se escribe `q` en la URL y sale **una** request. Enter confirma al
  instante.
- **Debounce vs throttle:** debounce espera silencio (búsqueda); throttle limita la frecuencia (scroll).
- **Dónde:** `src/features/wanted/SearchBox.tsx`.

### Respuestas viejas que llegan tarde (race condition)
- **Problema:** pides A (lenta) y luego B (rápida). Si A llega última y pisa a B, la consola muestra un
  "rumbo falso".
- **Solución en `useApi`, dos capas:**
  1. Un `AbortController` por request. El cleanup del efecto aborta la anterior y antes de cada `setState` se
     revisa `signal.aborted` (por si la respuesta ya había llegado).
  2. Cada resultado se guarda junto con las deps que lo pidieron. Si las deps actuales son otras, el estado
     es `loading`: nunca se trata un dato viejo como respuesta a la request nueva.
- **Dónde:** `src/hooks/useApi.ts`.

### Loading, error y sin resultados sin mover el layout
- Barra de estado de alto fijo, contenedor con alto mínimo, skeleton del mismo número de filas que había y
  paginación siempre visible (deshabilitada mientras carga).
- Mientras carga mostramos skeleton, **no** las filas viejas: nunca se ven datos de otros filtros.

### Detalle y volver "exactamente como se dejó"
- **Solución:** `/wanted/:id` es **ruta hija** de `/wanted`. El detalle se pinta en el `<Outlet />` como un
  panel encima del listado, así que el listado **nunca se desmonta**: conserva página, scroll y datos, y no
  vuelve a pedir nada.
- Cerrar = `navigate(-1)` si vino del listado; si abrieron el link directo, va a `/wanted` con la misma query.
- **Dónde:** `src/router.tsx`, `src/features/wanted/WantedDetailPage.tsx`, `WantedTable.tsx`
  (`state={{ fromList: true }}` y `preventScrollReset`).

---

## Preguntas trampa probables

- **"¿Por qué en dev salen 2 requests?"** `StrictMode` monta, desmonta y vuelve a montar en desarrollo para
  detectar efectos sin cleanup. Nuestro cleanup aborta la primera. En producción sale una.
- **"¿Por qué no React Query?"** Está prohibido. Lo que necesitábamos (abort, ignorar respuestas viejas,
  estado en URL) lo resolvimos con `useApi` y `useSearchParams`.
- **"¿`localStorage` es seguro para el token?"** Un XSS podría leerlo. Una cookie `httpOnly` sería más segura,
  pero esta API usa `Authorization: Bearer`, que exige que JS tenga el token. Mitigación: React escapa todo
  lo que renderiza y no usamos `dangerouslySetInnerHTML`.
- **"¿Qué pasa si el backend tarda (Render en frío)?"** Splash/skeleton mientras carga y error con reintento
  si falla.
