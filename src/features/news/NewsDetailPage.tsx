import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiRequest, ApiError } from '../../lib/api';
import type { NewsDetail } from '../../types/api';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

// CP4 · Owner: Camila. Route: /news/:id (child of /news).
export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<NewsDetail>(`/news/${id}`);
      setNews(data);
    } catch (err: unknown) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleVerify = async (status: 'CONFIRMED' | 'DEBUNKED') => {
    if (!id || updating) return;
    setUpdating(true);
    setUpdateError(null);
    setSuccessMsg(null);

    try {
      const updated = await apiRequest<NewsDetail>(`/news/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setNews(updated);
      setSuccessMsg(`Marcado como ${status}`);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setUpdateError(apiErr.message || 'No se pudo actualizar');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-4 border rounded shadow mb-6"><Spinner /></div>;
  if (error && !news) return <div className="mb-6"><ErrorState error={error} onRetry={fetchDetail} /></div>;
  if (!news) return null;

  return (
    <div className="bg-white border p-6 rounded shadow mb-8 relative">
      <button 
        onClick={() => navigate('/news' + window.location.search)} 
        className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl"
      >
        &times;
      </button>
      
      <h2 className="text-2xl font-bold mb-4 pr-8">{news.title}</h2>
      <p className="text-gray-700 mb-6">{news.summary}</p>
      
      <div className="mb-4">
        <span className="font-semibold">Estado actual: </span>
        <span className="px-2 py-1 bg-gray-200 rounded">{news.status}</span>
      </div>

      {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{successMsg}</div>}
      {updateError && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{updateError}</div>}

      {news.status === 'RUMOR' && (
        <div className="flex gap-4 border-t pt-4">
          <button
            disabled={updating}
            onClick={() => handleVerify('CONFIRMED')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {updating ? 'Procesando...' : 'Confirmar'}
          </button>
          <button
            disabled={updating}
            onClick={() => handleVerify('DEBUNKED')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {updating ? 'Procesando...' : 'Desmentir'}
          </button>
        </div>
      )}
    </div>
  );
}