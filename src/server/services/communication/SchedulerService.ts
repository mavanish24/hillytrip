import { NotificationEventPayload, NotificationEventType } from '../../../types/communication';

export interface ScheduledTask {
  id: string;
  triggerAt: string;
  payload: NotificationEventPayload;
  status: 'pending' | 'triggered' | 'cancelled';
  taskType: string;
}

export class SchedulerService {
  private tasks: Map<string, ScheduledTask> = new Map();
  private onTriggerCallback?: (payload: NotificationEventPayload) => void;

  constructor() {
    // Check every 30 seconds for due scheduled tasks
    setInterval(() => this.checkTasks(), 30000);
  }

  public setOnTrigger(callback: (payload: NotificationEventPayload) => void) {
    this.onTriggerCallback = callback;
  }

  public scheduleReminder(
    taskType: 'journey_tomorrow' | 'journey_2hr' | 'quote_expiry' | 'operator_reminder' | 'review_reminder',
    triggerAt: Date,
    payload: NotificationEventPayload
  ): ScheduledTask {
    const task: ScheduledTask = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      triggerAt: triggerAt.toISOString(),
      payload,
      status: 'pending',
      taskType
    };

    this.tasks.set(task.id, task);
    console.log(`[SchedulerService] Scheduled ${taskType} for ${triggerAt.toISOString()} (ID: ${task.id})`);
    return task;
  }

  public cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.status = 'cancelled';
    return true;
  }

  public getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  private checkTasks() {
    const now = new Date();
    this.tasks.forEach(task => {
      if (task.status === 'pending' && new Date(task.triggerAt) <= now) {
        task.status = 'triggered';
        console.log(`[SchedulerService] Triggering scheduled task ${task.taskType} (ID: ${task.id})`);
        if (this.onTriggerCallback) {
          try {
            this.onTriggerCallback(task.payload);
          } catch (err) {
            console.error(`[SchedulerService] Error executing scheduled task callback:`, err);
          }
        }
      }
    });
  }
}
