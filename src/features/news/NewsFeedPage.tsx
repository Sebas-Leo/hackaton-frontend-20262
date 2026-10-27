import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link, Outlet } from 'react-router';
import { apiRequest, ApiError } from '../../lib/api';
import type { NewsFeed, NewsItem } from '../../types/api';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

// CP4 · Owner: Camila. Route: /news (detail /news/:id renders in <Outlet />, so the feed keeps its items and scroll).
export function NewsFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get('type') || '';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';

  const [items, setItems] = useState<NewsItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [moreError, setMoreError] = useState<string | null>(null);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const fetchInitial = useCallback(async (signal?: AbortSignal) => {
    setLoadingInitial(true);
    setError(null);
    try {
      const data = await apiRequest<NewsFeed>('/news/feed', {
        query: { limit: 20, type, priority, status },
        signal,
      });
      setItems(data.items);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Error al cargar las noticias');
      }
    } finally {
      setLoadingInitial(false);
    }
  }, [type, priority, status]);

  useEffect(() => {
    const controller = new AbortController();
    fetchInitial(controller.signal);
    return () => controller.abort();
  }, [fetchInitial]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    setMoreError(null);

    try {
      const data = await apiRequest<NewsFeed>('/news/feed', {
        query: { cursor: nextCursor, limit: 20, type, priority, status },
      });

      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newUniqueItems = data.items.filter((i) => !existingIds.has(i.id));
        return [...prev, ...newUniqueItems];
      });

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err: any) {
      setMoreError(err.message || 'Error al cargar más noticias');
    } finally {
      setLoadingMore(false);
    }
  };

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      if (loadingInitial || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingInitial, loadingMore, hasMore]
  );

  return (
    <section className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">News Coo</h1>
      
      {/* El Outlet renderiza NewsDetailPage aquí cuando la ruta es /news/:id */}
      <Outlet />

      <div className="flex gap-4 mb-6">
        <select 
          className="p-2 border rounded" 
          value={type} 
          onChange={(e) => updateFilter('type', e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="BOUNTY">Recompensas</option>
          <option value="INCIDENT">Incidentes</option>
          <option value="WORLD_GOVERNMENT">Gobierno Mundial</option>
        </select>

        <select 
          className="p-2 border rounded" 
          value={status} 
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="RUMOR">Rumor</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="DEBUNKED">Desmentido</option>
        </select>
      </div>

      {loadingInitial ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => fetchInitial()} />
      ) : items.length === 0 ? (
        <EmptyState title="Sin noticias">No hay resultados.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <Link
                to={`/news/${item.id}`}
                key={item.id}
                ref={isLast ? lastElementRef : null}
                className="p-4 border rounded shadow hover:bg-gray-50 transition block"
              >
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-500">Estado: {item.status}</p>
              </Link>
            );
          })}

          {loadingMore && <div className="py-4"><Spinner /></div>}
          
          {moreError && (
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{moreError}</p>
              <button 
                onClick={loadMore} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}