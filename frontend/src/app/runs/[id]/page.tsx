'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { RunDetail, Event, Task } from '@/lib/types';

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = parseInt(params.id as string);
  
  const [run, setRun] = useState<RunDetail | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRunDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<RunDetail>(`/runs/${runId}`);
      setRun(data);
      setEvents(data.recent_events || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load run details');
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    loadRunDetail();
    
    // Set up SSE connection for real-time updates
    const eventSource = apiClient.createEventSource(`/runs/${runId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'event') {
          setEvents((prev) => [data.event, ...prev]);
        } else if (data.type === 'run_update') {
          setRun((prev) => prev ? { ...prev, status: data.status } : null);
        } else if (data.type === 'task_update') {
          setRun((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === data.task.id ? data.task : t
              ),
            };
          });
        }
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error, reconnecting...');
      eventSource.close();
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        loadRunDetail();
      }, 3000);
    };

    return () => {
      eventSource.close();
    };
  }, [runId, loadRunDetail]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-stark-success text-stark-success';
      case 'running':
        return 'bg-stark-accent text-stark-accent';
      case 'failed':
        return 'bg-stark-error text-stark-error';
      default:
        return 'bg-gray-500 text-gray-500';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-stark-success border-stark-success';
      case 'error':
        return 'text-stark-error border-stark-error';
      case 'warning':
        return 'text-stark-warning border-stark-warning';
      case 'system':
        return 'text-stark-accent border-stark-accent';
      default:
        return 'text-gray-400 border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8">
          <div className="animate-spin w-12 h-12 border-4 border-stark-accent border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-stark-error mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error || 'Run not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="glass-button w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="glass-button text-sm"
          >
            ← Back
          </button>
          <div className={`status-badge ${getStatusColor(run.status)} bg-opacity-20`}>
            {run.status.toUpperCase()}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-stark-accent mb-2">{run.title}</h1>
        {run.description && (
          <p className="text-gray-400 mb-4">{run.description}</p>
        )}
        
        <div className="flex gap-6 text-sm text-gray-400">
          <div>
            <span className="font-semibold">Created:</span>{' '}
            {new Date(run.created_at).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Updated:</span>{' '}
            {new Date(run.updated_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-stark-accent mb-4">
            Tasks ({run.tasks.length})
          </h2>
          
          <div className="space-y-3">
            {run.tasks.length === 0 ? (
              <p className="text-gray-500 italic">No tasks yet</p>
            ) : (
              run.tasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-panel p-4 hover:border-stark-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className={`status-badge ${getStatusColor(task.status)} bg-opacity-20`}>
                      {task.status}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Events Section */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-stark-accent mb-4">
            Live Events ({events.length})
          </h2>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500 italic">No events yet</p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded border-l-4 ${getEventTypeColor(event.event_type)} bg-stark-panel/50`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold uppercase ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleTimeString()}
                      </span>
                      </div>
                      <p className="text-sm text-gray-300">{event.message}</p>
                      {event.event_metadata && (
                        <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
                          {event.event_metadata}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
