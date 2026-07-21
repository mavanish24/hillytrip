import { BusinessLifecycleState, LifecycleHistoryEntry, LifecycleStateConfig } from '../types/lifecycle';
import { LIFECYCLE_STATES, getLifecycleStateConfig } from './lifecycleRegistry';

export class BusinessLifecycleEngine {
  /**
   * Initializes a brand-new lifecycle state for a business, starting in the 'draft' state.
   */
  static start(businessId: string): BusinessLifecycleState {
    const initialEntry: LifecycleHistoryEntry = {
      id: 'lc-init-' + Math.random().toString(36).substring(2, 9),
      fromStateId: '',
      toStateId: 'draft',
      timestamp: new Date().toISOString(),
      actor: 'System',
      reason: 'Business profile record initialized in Draft state.',
      transitionType: 'automatic'
    };

    return {
      businessId,
      currentStateId: 'draft',
      history: [initialEntry]
    };
  }

  /**
   * Validates if a transition is allowed from the current state to the target state.
   */
  static validateTransition(
    currentState: BusinessLifecycleState,
    targetStateId: string
  ): { isValid: boolean; message: string; fromConfig?: LifecycleStateConfig; toConfig?: LifecycleStateConfig } {
    const fromConfig = getLifecycleStateConfig(currentState.currentStateId);
    const toConfig = getLifecycleStateConfig(targetStateId);

    if (!fromConfig) {
      return { isValid: false, message: `Current state "${currentState.currentStateId}" is unrecognized.` };
    }
    if (!toConfig) {
      return { isValid: false, message: `Target state "${targetStateId}" is unrecognized.` };
    }

    if (currentState.currentStateId === targetStateId) {
      return { isValid: false, message: `Already in the state "${targetStateId}".` };
    }

    const isAllowed = fromConfig.allowedTransitions.includes(targetStateId);
    if (!isAllowed) {
      return {
        isValid: false,
        message: `Lifecycle violation: Transition from "${fromConfig.title}" to "${toConfig.title}" is forbidden.`,
        fromConfig,
        toConfig
      };
    }

    return { isValid: true, message: 'Transition permitted.', fromConfig, toConfig };
  }

  /**
   * Transitions a business to a target lifecycle state manually.
   */
  static transition(
    currentState: BusinessLifecycleState,
    targetStateId: string,
    params: { actor: string; reason?: string }
  ): BusinessLifecycleState {
    const validation = this.validateTransition(currentState, targetStateId);
    if (!validation.isValid) {
      throw new Error(`Lifecycle Transition Error: ${validation.message}`);
    }

    const historyEntry: LifecycleHistoryEntry = {
      id: 'lc-trans-' + Math.random().toString(36).substring(2, 9),
      fromStateId: currentState.currentStateId,
      toStateId: targetStateId,
      timestamp: new Date().toISOString(),
      actor: params.actor,
      reason: params.reason || `Transitioned to ${validation.toConfig?.title}.`,
      transitionType: 'manual'
    };

    return {
      ...currentState,
      currentStateId: targetStateId,
      history: [...currentState.history, historyEntry]
    };
  }

  /**
   * Transitions a business automatically using predefined or dynamic system rules.
   */
  static autoTransition(
    currentState: BusinessLifecycleState,
    targetStateId: string,
    params: { reason?: string } = {}
  ): BusinessLifecycleState {
    const validation = this.validateTransition(currentState, targetStateId);
    if (!validation.isValid) {
      throw new Error(`Lifecycle Auto-Transition Error: ${validation.message}`);
    }

    const historyEntry: LifecycleHistoryEntry = {
      id: 'lc-auto-' + Math.random().toString(36).substring(2, 9),
      fromStateId: currentState.currentStateId,
      toStateId: targetStateId,
      timestamp: new Date().toISOString(),
      actor: 'System',
      reason: params.reason || `Automated transition to ${validation.toConfig?.title}.`,
      transitionType: 'automatic'
    };

    return {
      ...currentState,
      currentStateId: targetStateId,
      history: [...currentState.history, historyEntry]
    };
  }

  /**
   * Registers a scheduled future transition.
   */
  static scheduleTransition(
    currentState: BusinessLifecycleState,
    targetStateId: string,
    executionTime: Date,
    params: { actor: string; reason?: string }
  ): BusinessLifecycleState {
    const validation = this.validateTransition(currentState, targetStateId);
    if (!validation.isValid) {
      throw new Error(`Lifecycle Scheduling Error: ${validation.message}`);
    }

    const historyEntry: LifecycleHistoryEntry = {
      id: 'lc-sched-' + Math.random().toString(36).substring(2, 9),
      fromStateId: currentState.currentStateId,
      toStateId: targetStateId,
      timestamp: new Date().toISOString(),
      actor: params.actor,
      reason: params.reason || `Scheduled future transition to ${validation.toConfig?.title}.`,
      transitionType: 'scheduled',
      scheduledExecutionTime: executionTime.toISOString()
    };

    return {
      ...currentState,
      // Does NOT update currentStageId yet because it is scheduled for future
      history: [...currentState.history, historyEntry]
    };
  }

  /**
   * Helper to inspect the current active permissions/capabilities for the business
   * based on its current lifecycle state.
   */
  static getPermissions(stateId: string): Omit<LifecycleStateConfig, 'id' | 'title' | 'description' | 'color' | 'icon' | 'allowedTransitions'> {
    const config = getLifecycleStateConfig(stateId);
    if (!config) {
      return {
        isPublic: false,
        canReceiveBookings: false,
        canReceiveMessages: false,
        canEditProfile: false,
        canAppearInSearch: false,
        canReceiveReviews: false,
        canReceivePayments: false
      };
    }

    return {
      isPublic: config.isPublic,
      canReceiveBookings: config.canReceiveBookings,
      canReceiveMessages: config.canReceiveMessages,
      canEditProfile: config.canEditProfile,
      canAppearInSearch: config.canAppearInSearch,
      canReceiveReviews: config.canReceiveReviews,
      canReceivePayments: config.canReceivePayments
    };
  }
}
