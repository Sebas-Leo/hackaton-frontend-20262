import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useApi } from '../../hooks/useApi'
import { apiRequest, toApiError, type ApiError } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import type { NewsDetail, NewsItem, NewsStatusUpdate } from '../../types/api'
import { NewsBadges } from './NewsBadges'
import { NewsLocked } from './NewsLocked'
import { isLogPoseLocked } from './news-errors'
import { STATUS_LABELS } from './news-labels'
import { useNewsOutletContext } from './news-outlet'

type VerifiedStatus = NewsStatusUpdate['status']

type VerifyState =
  | { phase: 'idle' }
  | { phase: 'saving'; target: VerifiedStatus }
  | { phase: 'notice'; tone: 'success' | 'warning'; message: string }
  | { phase: 'error'; target: VerifiedStatus; error: ApiError }

const SUCCESS_MESSAGES: Record<VerifiedStatus, string> = {
  CONFIRMED: 'Noticia confirmada correctamente.',
  DEBUNKED: 'Noticia desmentida correctamente.',
}

function cameFromList(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'fromList' in state && state.fromList === true
}

// CP4 · Owner: Camila. Route: /news/:id, rendered as a drawer over the (still mounted) feed.
export function NewsDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { onItemUpdated } = useNewsOutletContext()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const fromList = cameFromList(location.state)

  const detail = useApi((signal) => apiRequest<NewsDetail>(`/news/${encodeURIComponent(id)}`, { signal }), [id])

  const close = useCallback(() => {
    // Opened from the feed: going back restores that exact history entry (filters and scroll),
    // and the feed never unmounted, so nothing is requested again.
    if (fromList) navigate(-1)
    else navigate({ pathname: '/news', search: location.search }, { preventScrollReset: true })
  }, [fromList, navigate, location.search])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close])

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={close}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-detail-title"
        onClick={(event) => event.stopPropagation()}
        className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-800 bg-slate-950 p-4 sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="news-detail-title" className="text-xl font-bold">
            {detail.data?.title ?? 'Noticia'}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            className="shrink-0 rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>

        {detail.status === 'loading' && <Spinner label="Cargando noticia…" />}

        {detail.status === 'error' &&
          (isLogPoseLocked(detail.error) ? (
            <NewsLocked />
          ) : detail.error.status === 404 ? (
            <p className="text-slate-400">Esta noticia no existe.</p>
          ) : (
            <ErrorState title="No se pudo cargar la noticia" error={detail.error} onRetry={detail.reload} />
          ))}

        {/* key: another id always starts from its own fetched state, never from the previous news. */}
        {detail.status === 'success' && (
          <NewsDetailContent key={detail.data.id} initial={detail.data} onItemUpdated={onItemUpdated} />
        )}
      </article>
    </div>
  )
}

interface NewsDetailContentProps {
  initial: NewsDetail
  onItemUpdated: (item: NewsItem) => void
}

function NewsDetailContent({ initial, onItemUpdated }: NewsDetailContentProps) {
  const [news, setNews] = useState(initial)
  const [verify, setVerify] = useState<VerifyState>({ phase: 'idle' })
  // Set synchronously: a double click can not send two PATCH before the buttons re-render as disabled.
  const busy = useRef(false)

  const saving = verify.phase === 'saving'

  // The server's version is the truth: show it here and replace the item in the feed behind the drawer.
  function applyServerNews(updated: NewsDetail) {
    setNews(updated)
    onItemUpdated(updated)
  }

  async function verifyAs(target: VerifiedStatus) {
    if (busy.current) return
    busy.current = true
    setVerify({ phase: 'saving', target })

    try {
      const body: NewsStatusUpdate = { status: target }
      // No AbortSignal on purpose: if the drawer closes mid-request the PATCH still completes
      // and the (mounted) feed still receives the result.
      const updated = await apiRequest<NewsDetail>(`/news/${encodeURIComponent(news.id)}/status`, {
        method: 'PATCH',
        body,
      })
      applyServerNews(updated)
      setVerify({ phase: 'notice', tone: 'success', message: SUCCESS_MESSAGES[target] })
    } catch (error) {
      const apiError = toApiError(error)
      // 409: somebody verified it first. The body carries the real current news.
      const current = apiError.code === 'NEWS_ALREADY_VERIFIED' ? apiError.body?.current : undefined
      if (current) {
        applyServerNews(current)
        setVerify({
          phase: 'notice',
          tone: 'warning',
          message: `Esta noticia ya había sido verificada: su estado actual es «${STATUS_LABELS[current.status]}».`,
        })
      } else {
        // The previous state stays untouched, so the same action can simply be retried.
        setVerify({ phase: 'error', target, error: apiError })
      }
    } finally {
      busy.current = false
    }
  }

  return (
    <div className="space-y-5">
      <NewsBadges item={news} />

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Item label="Isla" value={news.island} />
        <Item label="Fuente" value={news.source} />
        <Item label="Publicada" value={formatDateTime(news.publishedAt)} />
        <Item label="Actualizada" value={formatDateTime(news.updatedAt)} />
        {news.verifiedAt && <Item label="Verificada" value={formatDateTime(news.verifiedAt)} />}
        {news.relatedWanted && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Cartel relacionado</dt>
            <dd>
              <Link to={`/wanted/${news.relatedWanted.id}`} className="text-amber-300 hover:underline">
                {news.relatedWanted.name}
              </Link>
            </dd>
          </div>
        )}
      </dl>

      <p className="font-medium text-slate-200">{news.summary}</p>

      <div className="space-y-3 text-sm leading-relaxed text-slate-300">
        {news.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <section aria-labelledby="news-verify-title" className="space-y-3 rounded-lg border border-slate-800 p-4">
        <h3 id="news-verify-title" className="text-sm font-semibold text-slate-400">
          Verificación
        </h3>

        {news.status === 'RUMOR' ? (
          <>
            <p className="text-sm text-slate-300">Este rumor todavía no fue verificado.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void verifyAs('CONFIRMED')}
                className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-50 hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving && verify.target === 'CONFIRMED' ? 'Confirmando…' : 'Confirmar'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void verifyAs('DEBUNKED')}
                className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-50 hover:bg-slate-600 disabled:opacity-50"
              >
                {saving && verify.target === 'DEBUNKED' ? 'Desmintiendo…' : 'Desmentir'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-300">Esta noticia ya fue verificada: {STATUS_LABELS[news.status]}.</p>
        )}

        <div aria-live="polite">
          {verify.phase === 'notice' && (
            <p className={`text-sm font-medium ${verify.tone === 'success' ? 'text-emerald-300' : 'text-amber-300'}`}>
              {verify.message}
            </p>
          )}
        </div>

        {verify.phase === 'error' && (
          <ErrorState
            title="No se pudo verificar la noticia"
            error={verify.error}
            onRetry={() => void verifyAs(verify.target)}
          />
        )}
      </section>
    </div>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
