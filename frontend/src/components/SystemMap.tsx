'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { RunDetail } from '@/lib/types';

interface SystemMapProps {
  selectedRunId: number | null;
}

export default function SystemMap({ selectedRunId }: SystemMapProps) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRunId) {
      setRun(null);
      return;
    }

    const loadRunDetail = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<RunDetail>(`/runs/${selectedRunId}`);
        setRun(data);
      } catch (err) {
        console.error('Failed to load run details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRunDetail();
  }, [selectedRunId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-stark-success text-stark-success';
      case 'running':
        return 'border-stark-accent text-stark-accent';
      case 'failed':
        return 'border-stark-error text-stark-error';
      case 'pending':
        return 'border-gray-500 text-gray-500';
      default:
        return 'border-gray-500 text-gray-500';
    }
  };

  if (!selectedRunId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-stark-border flex items-center justify-center">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-400">System Map</h3>
          <p className="text-sm">Select a run to visualize the execution flow</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-stark-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading run details...</p>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Failed to load run details</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Run Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{run.title}</h2>
            {run.description && (
              <p className="text-gray-400 text-sm mb-3">{run.description}</p>
            )}
          </div>
          <div className={`px-3 py-1 rounded border ${getStatusColor(run.status)}`}>
            {run.status.toUpperCase()}
          </div>
        </div>
        
        <div className="flex gap-4 text-sm text-gray-400">
          <span>Created: {new Date(run.created_at).toLocaleString()}</span>
          <span>•</span>
          <span>Updated: {new Date(run.updated_at).toLocaleString()}</span>
        </div>
      </div>

      {/* System Map Visualization */}
      <div className="flex-1 relative">
        {/* Central Node - Run */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`glass-panel p-6 border-2 ${getStatusColor(run.status)} relative`}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-current flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="font-bold">Run #{run.id}</div>
              <div className="text-xs text-gray-400 mt-1">{run.status}</div>
            </div>
          </div>
        </div>

        {/* Task Nodes - Arranged in circle */}
        {run.tasks.map((task, index) => {
          const angle = (index * 360) / run.tasks.length;
          const radius = 200;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div
              key={task.id}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div className={`glass-panel p-4 border ${getStatusColor(task.status)} w-32`}>
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full border-2 ${getStatusColor(task.status)} flex items-center justify-center`}>
                    <span className="text-xs font-bold">T{task.id}</span>
                  </div>
                  <div className="text-xs font-semibold line-clamp-2">{task.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{task.status}</div>
                </div>
              </div>
              
              {/* Connection Line to Center */}
              <svg
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{
                  width: Math.abs(x) + 50,
                  height: Math.abs(y) + 50,
                  transform: `translate(${x > 0 ? '-100%' : '0'}, ${y > 0 ? '-100%' : '0'})`,
                }}
              >
                <line
                  x1={x > 0 ? '100%' : '0'}
                  y1={y > 0 ? '100%' : '0'}
                  x2={x > 0 ? '0' : '100%'}
                  y2={y > 0 ? '0' : '100%'}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-stark-border opacity-50"
                />
              </svg>
            </div>
          );
        })}

        {/* No Tasks Message */}
        {run.tasks.length === 0 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-500">
            <p className="text-sm">No tasks created yet</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-stark-accent">{run.tasks.length}</div>
          <div className="text-xs text-gray-400 mt-1">Total Tasks</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-stark-success">
            {run.tasks.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-stark-warning">
            {run.tasks.filter(t => t.status === 'running').length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Running</div>
        </div>
      </div>
    </div>
  );
}
