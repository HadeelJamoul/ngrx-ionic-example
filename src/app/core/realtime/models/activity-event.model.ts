// Normalized domain event used by store and UI only
export type ActivityEventType =
  | 'task.updated'
  | 'task.created'
  | 'task.deleted'
  | 'user.joined'
  | 'user.left'
  | 'system'
  | 'unknown';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  message: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export const KNOWN_ACTIVITY_EVENT_TYPES: readonly ActivityEventType[] = [
  'task.updated',
  'task.created',
  'task.deleted',
  'user.joined',
  'user.left',
  'system',
  'unknown',
] as const;

export function isActivityEventType(value: string): value is ActivityEventType {
  return (KNOWN_ACTIVITY_EVENT_TYPES as readonly string[]).includes(value);
}
