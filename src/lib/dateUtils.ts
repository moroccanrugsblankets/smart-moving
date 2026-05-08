function parseDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPublicationDate(iso: string, fallback = 'Date inconnue') {
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
  return date ? date.toISOString() : undefined;
}
