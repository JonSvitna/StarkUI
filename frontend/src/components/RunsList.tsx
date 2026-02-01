'use client';

import { Run } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface RunsListProps {
  runs: Run[];
  selectedRunId: number | null;
  onSelectRun: (id: number) => void;
  loading: boolean;
}

export default function RunsList({ runs, selectedRunId, onSelectRun, loading }: RunsListProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-stark-success';
      case 'running':
        return 'bg-stark-accent animate-pulse';
      case 'failed':
        return 'bg-stark-error';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRunClick = (run: Run) => {
    onSelectRun(run.id);
    router.push(`/runs/${run.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-stark-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="mb-2">No runs yet</p>
        <p className="text-sm">Create a new run to get started</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {runs.map((run) => (
        <div
          key={run.id}
          onClick={() => handleRunClick(run)}
          className={`glass-panel p-4 cursor-pointer transition-all duration-200 hover:border-stark-accent ${
            selectedRunId === run.id ? 'border-stark-accent bg-stark-accent/10' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-1">{run.title}</h3>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(run.status)} flex-shrink-0 ml-2 mt-1`}></div>
          </div>
          
          {run.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
              {run.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded ${getStatusColor(run.status)} bg-opacity-20 text-gray-300`}>
              {run.status}
            </span>
            <span>{new Date(run.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
