export interface WorkflowAction {
  id: string;
  label: string;
  targetStageId: string;
  requiredRole?: string[]; // e.g., ['admin', 'reviewer', 'partner']
  color?: string; // Tailwind color class or hex, e.g. 'bg-indigo-600 hover:bg-indigo-700'
}

export interface WorkflowTransition {
  fromStageId: string;
  toStageId: string;
  actionId: string;
  timestamp: string;
  reviewerName?: string;
  comment?: string;
}

export interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  statusColor: string; // CSS color classes, e.g., 'bg-amber-100 text-amber-800 border-amber-200'
  allowedActions: WorkflowAction[];
  nextStages: string[]; // Stage IDs we can navigate to
  isFinalStage?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  initialStageId: string;
  stages: Record<string, WorkflowStage>;
}

export interface WorkflowHistoryEntry {
  id: string;
  fromStageId: string;
  toStageId: string;
  actionId: string;
  timestamp: string;
  reviewerName?: string;
  comment?: string;
}

export interface WorkflowState {
  workflowId: string;
  currentStageId: string;
  history: WorkflowHistoryEntry[];
}
