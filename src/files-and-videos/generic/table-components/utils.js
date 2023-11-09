import { isEmpty } from 'lodash';

const getFilterDisplayName = (column, values) => {
  const displayNames = [];
  const { filterChoices } = column;
  values.forEach(value => {
    const [displayName] = filterChoices.filter(choice => choice.value === value);
    displayNames.push(displayName);
  });
  return displayNames;
};

export const getFilters = (state, columns) => {
  const { filters } = state;
  const filterableColumns = columns.filter(column => column?.filterChoices);
  const allFilters = [];
  filters.forEach(filter => {
    const { id, value } = filter;
    const [filterColumn] = filterableColumns.filter(column => column.id === id);
    const currentFilters = getFilterDisplayName(filterColumn, value);
    allFilters.push(...currentFilters);
  });
  return allFilters;
};

export const removeFilter = (filter, setFilter, setAllFilters, state) => {
  const { filters } = state;
  const [editedFilter] = filters.filter(currentFilter => currentFilter.value.includes(filter));
  const updatedFilterValue = editedFilter.value.filter(value => value !== filter);
  if (isEmpty(updatedFilterValue)) {
    const updatedFilters = filters.filter(currentFilter => currentFilter.id !== editedFilter.id);
    setAllFilters(updatedFilters);
  } else {
    setFilter(editedFilter.id, updatedFilterValue);
  }
};

export const getCurrentViewRange = (totalFileCount) => {
  if (totalFileCount > 50) {
    return `Showing 50 of ${totalFileCount}`;
  }
  return `Showing ${totalFileCount} of ${totalFileCount}`;
};
