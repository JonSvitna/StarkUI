export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';
export type EventType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type PatchStatus = 'preview' | 'pending' | 'applied' | 'failed';

export interface Run {
  id: number;
  title: string;
  description?: string;
  status: RunStatus;
  created_at: string;
  updated_at: string;
}

export interface RunDetail extends Run {
  tasks: Task[];
  recent_events: Event[];
}

export interface Task {
  id: number;
  run_id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  run_id: number;
  event_type: EventType;
  message: string;
  event_metadata?: string;
  created_at: string;
}

export interface Patch {
  id: number;
  run_id: number;
  file_path: string;
  diff_content: string;
  status: PatchStatus;
  created_at: string;
  applied_at?: string;
}

export interface SSEEvent {
  type: string;
  [key: string]: any;
}
