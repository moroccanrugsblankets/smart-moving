import { activityLogsStore } from './fileStore';

export function logActivity(
  userId: string,
  userEmail: string,
  action: string,
  resource: string,
  details: string
): void {
  activityLogsStore
    .add({
      id: crypto.randomUUID(),
      userId,
      userEmail,
      action,
      resource,
      details,
      createdAt: new Date().toISOString(),
    })
    .catch(err => {
      // Never break app flow on logging failures
      console.error('[activityLogger] Failed to write activity log:', err);
    });
}
