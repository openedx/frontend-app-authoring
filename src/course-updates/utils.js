// eslint-disable-next-line import/prefer-default-export
export const matchesAnyStatus = (statuses, status) => Object.values(statuses).some(s => s === status);
