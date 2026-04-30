export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function fmt(date) {
  if (!date) return '—';
  return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export function daysBetween(start, due) {
  if (!start || !due) return 0;
  const one = new Date(`${start}T00:00:00`);
  const two = new Date(`${due}T00:00:00`);
  return Math.max(1, Math.round((two - one) / 86400000) + 1);
}
