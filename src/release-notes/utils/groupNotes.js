import moment from 'moment';

export const dayKey = (iso) => (iso ? moment(iso).format('YYYY-MM-DD') : 'unscheduled');

export const dayLabel = (key, intl) => (
  key === 'unscheduled'
    ? intl.formatMessage({ id: 'release-notes.unscheduled.label', defaultMessage: 'Unscheduled' })
    : moment(key).format('MMMM D, YYYY')
);

export const groupNotesByDate = (notes, intl) => {
  const map = new Map();
  (notes || []).forEach((n) => {
    const key = dayKey(n.published_at);
    if (!map.has(key)) { map.set(key, []); }
    map.get(key).push(n);
  });

  // Sort groups by date desc, unscheduled last
  const keys = Array.from(map.keys()).sort((a, b) => {
    if (a === 'unscheduled') { return 1; }
    if (b === 'unscheduled') { return -1; }
    return moment(b).valueOf() - moment(a).valueOf();
  });

  return keys.map((k) => ({
    key: k,
    label: dayLabel(k, intl),
    items: map.get(k),
  }));
};
