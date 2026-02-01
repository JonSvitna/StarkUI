'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Run } from '@/lib/types';
import RunsList from '@/components/RunsList';
import SystemMap from '@/components/SystemMap';
import LiveFeed from '@/components/LiveFeed';

export default function Dashboard() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Run[]>('/runs');
      setRuns(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load runs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRun = async () => {
    try {
      setCreating(true);
      const newRun = await apiClient.post<Run>('/runs', {
        title: `Run ${new Date().toLocaleTimeString()}`,
        description: 'New agent run',
      });
      setRuns([newRun, ...runs]);
      setSelectedRunId(newRun.id);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create run');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glass-panel m-4 p-4 border-b border-stark-accent/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stark-accent to-blue-600 flex items-center justify-center">
              <span className="text-xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-stark-accent to-blue-400 bg-clip-text text-transparent">
                StarkUI Cockpit
              </h1>
              <p className="text-xs text-gray-400">AI Agent Control Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-stark-success animate-pulse"></div>
              <span className="text-gray-400">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 px-4 pb-4 overflow-hidden">
        {/* Left Sidebar - Runs List */}
        <aside className="w-80 glass-panel p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stark-accent">Runs</h2>
            <button
              onClick={handleCreateRun}
              disabled={creating}
              className="glass-button text-sm disabled:opacity-50"
            >
              {creating ? '...' : '+ New Run'}
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-stark-error/20 border border-stark-error rounded text-sm text-stark-error">
              {error}
            </div>
          )}

          <RunsList
            runs={runs}
            selectedRunId={selectedRunId}
            onSelectRun={setSelectedRunId}
            loading={loading}
          />
        </aside>

        {/* Center - System Map & Run Details */}
        <main className="flex-1 glass-panel p-6 overflow-auto">
          <SystemMap selectedRunId={selectedRunId} />
        </main>

        {/* Right Panel - Live Event Feed */}
        <aside className="w-96 glass-panel p-4 flex flex-col overflow-hidden">
          <h2 className="text-lg font-semibold text-stark-accent mb-4">
            Live Event Feed
          </h2>
          <LiveFeed runId={selectedRunId} />
        </aside>
      </div>
    </div>
  );
}
