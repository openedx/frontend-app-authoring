export const matchesAnyStatus = (statuses, status) => Object.values(statuses).some(s => s === status);
