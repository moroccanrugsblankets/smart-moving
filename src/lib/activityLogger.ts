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
  } catch {
    // Silently fail — logging should never break app flow
  }
}
