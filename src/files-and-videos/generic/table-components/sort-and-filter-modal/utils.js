import { isArray, isEmpty } from 'lodash';

export const getFilterOptions = (columns) => {
  const allOptions = [];
  const filterableColumns = columns.filter(column => column?.filterChoices);

  filterableColumns.forEach(column => {
    const { filterChoices } = column;
    allOptions.push(...filterChoices);
  });

  return allOptions;
};

export const getCheckedFilters = (state) => {
  const { filters } = state;
  const allFilters = [];
  filters.forEach(filter => {
    const { id, value } = filter;

    if (isArray(value)) {
      allFilters.push(...value);
    } else {
      allFilters.push([id, value]);
    }
  });

  return allFilters;
};

export const processFilters = (filters, columns, setAllFilters) => {
  const filterableColumns = columns.filter(column => column?.filterChoices);
  const allFilters = [];

  const [displayNameFilter] = filters.filter(filter => isArray(filter));
  if (displayNameFilter) {
    const [id, filterValue] = displayNameFilter;
    allFilters.push({ id, value: [filterValue] });
  }

  filterableColumns.forEach(({ id, filterChoices }) => {
    const filterValues = filterChoices.map(choice => choice.value);
    const matchingFilters = filterValues.filter(value => filters.includes(value));

    if (!isEmpty(matchingFilters)) {
      allFilters.push({ id, value: matchingFilters });
    }
  });

  setAllFilters(allFilters);
};
