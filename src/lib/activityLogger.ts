import { activityLogsStore } from './fileStore';

export function logActivity(
  userId: string,
  userEmail: string,
  action: string,
  resource: string,
  details: string
): void {
  try {
    activityLogsStore.add({
      id: crypto.randomUUID(),
      userId,
      userEmail,
      action,
      resource,
      details,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    // Log to console so failures are visible but never break app flow
    console.error('[activityLogger] Failed to write activity log:', err);
  }
}
