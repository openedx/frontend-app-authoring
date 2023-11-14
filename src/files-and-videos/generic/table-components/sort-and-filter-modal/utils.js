import { isArray, isEmpty } from 'lodash';

export const getFilterOptions = (columns) => {
  const allOptions = [];
  const filterableColumns = columns.filter(column => column?.filterChoices);

  filterableColumns.forEach(column => {
    const { id, filterChoices } = column;
    let updatedChoices = filterChoices;

    switch (id) {
    case 'locked':
      updatedChoices = filterChoices.map(choice => (
        { ...choice, value: choice.value ? 'locked' : 'public' }
      ));
      break;
    case 'usageLocations':
      updatedChoices = filterChoices.map(choice => (
        { ...choice, value: choice.value ? 'active' : 'inactive' }
      ));
      break;
    case 'transcripts':
      updatedChoices = filterChoices.map(choice => (
        { ...choice, value: choice.value ? 'transcribed' : 'notTranscribed' }
      ));
      break;
    default:
      break;
    }

    allOptions.push(...updatedChoices);
  });

  return allOptions;
};

export const getCheckedFilters = (state) => {
  const { filters } = state;
  const allFilters = [];
  filters.forEach(filter => {
    const { id, value } = filter;
    let updatedValues = value;

    switch (id) {
    case 'locked':
      updatedValues = value.map(val => (val ? 'locked' : 'public'));
      break;
    case 'usageLocations':
      updatedValues = value.map(val => (val ? 'active' : 'inactive'));
      break;
    case 'transcripts':
      updatedValues = value.map(val => (val ? 'transcribed' : 'notTranscribed'));
      break;
    default:
      break;
    }

    if (isArray(updatedValues)) {
      allFilters.push(...updatedValues);
    } else {
      allFilters.push(['displayName', updatedValues]);
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
    let processedFilters = filters;

    switch (id) {
    case 'locked':
      processedFilters = filters.map(match => {
        if (match === 'locked') {
          return true;
        }
        if (match === 'public') {
          return false;
        }
        return match;
      });
      break;
    case 'usageLocations':
      processedFilters = filters.map(match => {
        if (match === 'active') {
          return true;
        }
        if (match === 'inactive') {
          return false;
        }
        return match;
      });
      break;
    case 'transcripts':
      processedFilters = filters.map(match => {
        if (match === 'transcribed') {
          return true;
        }
        if (match === 'notTranscribed') {
          return false;
        }
        return match;
      });
      break;
    default:
      break;
    }

    const matchingFilters = filterValues.filter(value => processedFilters.includes(value));

    if (!isEmpty(matchingFilters)) {
      allFilters.push({ id, value: matchingFilters });
    }
  });

  setAllFilters(allFilters);
};
