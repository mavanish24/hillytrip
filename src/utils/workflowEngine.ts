import { Workflow, WorkflowState, WorkflowHistoryEntry, WorkflowAction } from '../types/workflow';
import { getWorkflow } from './workflowRegistry';

/**
 * Universal Workflow Engine.
 * Manages states, transitions, validations, history auditing, and rollbacks.
 * Production ready, purely configuration driven, no UI references.
 */
export class WorkflowEngine {
  /**
   * Starts a new workflow run and returns the initial state.
   */
  static start(workflowId: string): WorkflowState {
    const workflow = getWorkflow(workflowId);
    const initialEntry: WorkflowHistoryEntry = {
      id: 'init-' + Math.random().toString(36).substring(2, 9),
      fromStageId: '',
      toStageId: workflow.initialStageId,
      actionId: 'init',
      timestamp: new Date().toISOString(),
      reviewerName: 'System',
      comment: 'Workflow initialized.'
    };

    return {
      workflowId: workflow.id,
      currentStageId: workflow.initialStageId,
      history: [initialEntry]
    };
  }

  /**
   * Validates if a transition is allowed from the current stage using a given actionId.
   */
  static validateTransition(
    currentState: WorkflowState,
    actionId: string,
    role?: string // Optional role of the operator performing this action
  ): { isValid: boolean; message: string; action?: WorkflowAction } {
    const workflow = getWorkflow(currentState.workflowId);
    const currentStage = workflow.stages[currentState.currentStageId];
    
    if (!currentStage) {
      return { isValid: false, message: `Current stage "${currentState.currentStageId}" not found in workflow.` };
    }

    const action = currentStage.allowedActions.find(act => act.id === actionId);
    if (!action) {
      return { isValid: false, message: `Action "${actionId}" is not allowed in the current stage "${currentStage.title}".` };
    }

    // Role check
    if (action.requiredRole && action.requiredRole.length > 0) {
      if (!role || !action.requiredRole.includes(role)) {
        return { 
          isValid: false, 
          message: `Action "${action.label}" requires one of the roles: ${action.requiredRole.join(', ')}.` 
        };
      }
    }

    const targetStage = workflow.stages[action.targetStageId];
    if (!targetStage) {
      return { isValid: false, message: `Target stage "${action.targetStageId}" does not exist in workflow definition.` };
    }

    if (!currentStage.nextStages.includes(action.targetStageId)) {
      return { 
        isValid: false, 
        message: `Direct transition from "${currentStage.title}" to "${targetStage.title}" is forbidden by flow policy.` 
      };
    }

    return { isValid: true, message: 'Valid transition.', action };
  }

  /**
   * Performs a state transition, returning a newly updated WorkflowState.
   * Throws an error if transition is invalid.
   */
  static transition(
    currentState: WorkflowState,
    actionId: string,
    params: { reviewerName?: string; comment?: string; role?: string } = {}
  ): WorkflowState {
    const validation = this.validateTransition(currentState, actionId, params.role);
    if (!validation.isValid || !validation.action) {
      throw new Error(`Workflow transition forbidden: ${validation.message}`);
    }

    const action = validation.action;
    const historyEntry: WorkflowHistoryEntry = {
      id: 'trans-' + Math.random().toString(36).substring(2, 9),
      fromStageId: currentState.currentStageId,
      toStageId: action.targetStageId,
      actionId,
      timestamp: new Date().toISOString(),
      reviewerName: params.reviewerName || 'System',
      comment: params.comment || ''
    };

    return {
      ...currentState,
      currentStageId: action.targetStageId,
      history: [...currentState.history, historyEntry]
    };
  }

  /**
   * Safely rolls back the workflow to a previous state that exists in history.
   */
  static rollback(
    currentState: WorkflowState,
    targetStageId: string,
    params: { reviewerName?: string; comment?: string } = {}
  ): WorkflowState {
    const workflow = getWorkflow(currentState.workflowId);
    if (!workflow.stages[targetStageId]) {
      throw new Error(`Workflow Rollback Error: Target stage "${targetStageId}" does not exist in workflow.`);
    }

    // Rollback can only go to stages already visited in the history logs, or back to initial stage
    const visited = currentState.history.some(entry => entry.toStageId === targetStageId);
    if (!visited && targetStageId !== workflow.initialStageId) {
      throw new Error(`Workflow Rollback Error: Stage "${targetStageId}" was never visited in current history trace.`);
    }

    const historyEntry: WorkflowHistoryEntry = {
      id: 'rollback-' + Math.random().toString(36).substring(2, 9),
      fromStageId: currentState.currentStageId,
      toStageId: targetStageId,
      actionId: 'rollback',
      timestamp: new Date().toISOString(),
      reviewerName: params.reviewerName || 'System',
      comment: params.comment || `Rollback requested to "${workflow.stages[targetStageId].title}".`
    };

    return {
      ...currentState,
      currentStageId: targetStageId,
      history: [...currentState.history, historyEntry]
    };
  }
}
