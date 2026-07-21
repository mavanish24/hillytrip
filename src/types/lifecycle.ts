export interface LifecycleStateConfig {
  id: string;
  title: string;
  description: string;
  color: string; // Styling classes (Tailwind)
  icon: string; // Lucide icon name
  
  // Capability flags/Permissions
  isPublic: boolean;
  canReceiveBookings: boolean;
  canReceiveMessages: boolean;
  canEditProfile: boolean;
  canAppearInSearch: boolean;
  canReceiveReviews: boolean;
  canReceivePayments: boolean;

  // Permitted transitions out of this state
  allowedTransitions: string[]; // Array of target State IDs
}

export interface LifecycleHistoryEntry {
  id: string;
  fromStateId: string;
  toStateId: string;
  timestamp: string;
  actor: string; // e.g. 'System', 'Admin', 'Partner', 'Scheduler'
  reason?: string;
  transitionType: 'manual' | 'automatic' | 'scheduled';
  scheduledExecutionTime?: string; // If it was a scheduled transition
}

export interface BusinessLifecycleState {
  businessId: string;
  currentStateId: string;
  history: LifecycleHistoryEntry[];
}
