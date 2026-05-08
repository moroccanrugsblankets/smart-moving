function parseDate(iso: string) {
  const date = new Date(iso);
  return isNaN(date.getTime()) ? null : date;
}

export const UNKNOWN_PUBLICATION_DATE = 'Date inconnue';

export function formatPublicationDate(iso: string, fallback = UNKNOWN_PUBLICATION_DATE) {
  const date = parseDate(iso);
  if (!date) return fallback;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTimeAttribute(iso: string) {
  const date = parseDate(iso);
  return date ? date.toISOString() : null;
}
