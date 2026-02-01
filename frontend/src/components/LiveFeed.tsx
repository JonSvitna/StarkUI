'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { Event } from '@/lib/types';

interface LiveFeedProps {
  runId: number | null;
}

export default function LiveFeed({ runId }: LiveFeedProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Clean up previous connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (!runId) {
      setEvents([]);
      setConnected(false);
      return;
    }

    // Create new SSE connection
    const connectSSE = () => {
      try {
        const eventSource = apiClient.createEventSource(`/runs/${runId}/stream`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'event') {
              setEvents((prev) => [data.event, ...prev].slice(0, 100)); // Keep last 100 events
            }
          } catch (err) {
            console.error('Failed to parse SSE event:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);
          setConnected(false);
          setError('Connection lost. Reconnecting...');
          eventSource.close();
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            connectSSE();
          }, 3000);
        };
      } catch (err) {
        console.error('Failed to create SSE connection:', err);
        setError('Failed to connect');
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [runId]);

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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'system':
        return '⚙';
      default:
        return '•';
    }
  };

  if (!runId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p className="text-center">
          Select a run to view live events
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-stark-success animate-pulse' : 'bg-stark-error'}`}></div>
          <span className="text-gray-400">
            {connected ? 'Connected' : error || 'Disconnected'}
          </span>
        </div>
        <span className="text-gray-500">{events.length} events</span>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Waiting for events...</p>
            <div className="animate-pulse text-stark-accent">⟳</div>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded border-l-4 ${getEventTypeColor(event.event_type)} bg-stark-panel/50 animate-fade-in`}
            >
              <div className="flex items-start gap-2">
                <span className={`text-lg ${getEventTypeColor(event.event_type)} flex-shrink-0`}>
                  {getEventTypeIcon(event.event_type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 break-words">{event.message}</p>
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
  );
}
