import { isEmpty, isArray } from 'lodash';
import messages from '../messages';

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
    let currentFilters;

    if (filterColumn) {
      currentFilters = getFilterDisplayName(filterColumn, value);
    } else {
      const searchValue = Array.isArray(value) ? value[0] : value;
      currentFilters = [{ name: searchValue, value: searchValue }];
    }
    allFilters.push(...currentFilters);
  });

  return allFilters;
};

export const removeFilter = (filter, setFilter, setAllFilters, state) => {
  const { filters } = state;
  const [editedFilter] = filters.filter(currentFilter => currentFilter.value.includes(filter));

  let updatedFilterValue;
  if (isArray(editedFilter?.value)) {
    updatedFilterValue = editedFilter.value.filter(value => value !== filter);
  } else {
    updatedFilterValue = filter.includes(editedFilter?.value) ? [] : editedFilter.value;
  }

  if (isEmpty(updatedFilterValue)) {
    const updatedFilters = filters.filter(currentFilter => currentFilter.id !== editedFilter.id);
    setAllFilters(updatedFilters);
  } else {
    setFilter(editedFilter.id, updatedFilterValue);
  }
};

export const getCurrentViewRange = ({
  filterRowCount,
  initialRowCount,
  fileCount,
  intl,
}) => {
  if (filterRowCount === initialRowCount) {
    return intl.formatMessage(
      messages.rowStatusMessage,
      { fileCount, rowCount: initialRowCount },
    );
  }
  return intl.formatMessage(
    messages.rowStatusMessage,
    { fileCount, rowCount: filterRowCount },
  );
};
