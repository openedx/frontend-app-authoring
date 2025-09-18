import { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

import SearchFieldWrapper from 'shared/Components/Common/SearchField';
import { getStudioHomeCoursesParams } from '../../../data/selectors';
import { updateStudioHomeCoursesCustomParams } from '../../../data/slice';
import { fetchStudioHomeData } from '../../../data/thunks';
import CoursesTypesFilterMenu from './courses-types-filter-menu';
import CoursesOrderFilterMenu from './courses-order-filter-menu';
import './index.scss';

/* regex to check if a string has only whitespace
  example "    "
*/
const regexOnlyWhiteSpaces = /^\s+$/;

const CoursesFilters = ({
  dispatch,
  locationValue,
  onSubmitSearchField,
}) => {
  const studioHomeCoursesParams = useSelector(getStudioHomeCoursesParams);
  const {
    order,
    search,
    activeOnly,
    archivedOnly,
    cleanFilters,
  } = studioHomeCoursesParams;
  const [inputSearchValue, setInputSearchValue] = useState('');

  const getFilterTypeData = (baseFilters) => ({
    archivedCourses: { ...baseFilters, archivedOnly: true, activeOnly: undefined },
    activeCourses: { ...baseFilters, activeOnly: true, archivedOnly: undefined },
    allCourses: { ...baseFilters, archivedOnly: undefined, activeOnly: undefined },
    azCourses: { ...baseFilters, order: 'display_name' },
    zaCourses: { ...baseFilters, order: '-display_name' },
    newestCourses: { ...baseFilters, order: '-created' },
    oldestCourses: { ...baseFilters, order: 'created' },
  });

  const handleMenuFilterItemSelected = (filterType) => {
    const baseFilters = {
      currentPage: 1,
      search,
      order,
      isFiltered: true,
      archivedOnly,
      activeOnly,
      cleanFilters: false,
    };

    const filterParams = getFilterTypeData(baseFilters);
    const filterParamsFormat = filterParams[filterType] || baseFilters;
    const {
      coursesOrderLabel,
      coursesTypesLabel,
      isFiltered,
      orderTypeLabel,
      cleanFilters: cleanFilterParams,
      currentPage,
      ...customParams
    } = filterParamsFormat;

    dispatch(updateStudioHomeCoursesCustomParams(filterParamsFormat));
    dispatch(fetchStudioHomeData(locationValue, false, { page: 1, ...customParams }, true));
  };

  // Use ref to store the search handler that always gets current filter values
  const searchHandlerRef = useRef();
  searchHandlerRef.current = (searchValueDebounced) => {
    const valueFormatted = searchValueDebounced.trim();
    const filterParams = {
      search: valueFormatted.length > 0 ? valueFormatted : undefined,
      activeOnly,
      archivedOnly,
      order,
    };
    const hasOnlySpaces = regexOnlyWhiteSpaces.test(searchValueDebounced);

    if (valueFormatted !== search && !hasOnlySpaces && !cleanFilters) {
      dispatch(updateStudioHomeCoursesCustomParams({
        currentPage: 1,
        isFiltered: true,
        cleanFilters: false,
        ...filterParams,
      }));

      dispatch(fetchStudioHomeData(locationValue, false, { page: 1, ...filterParams }, true));
    }

    setInputSearchValue(searchValueDebounced);
  };

  // Stable debounced function that calls the current search handler
  const handleSearchCoursesDebounced = useCallback(
    debounce((value) => searchHandlerRef.current(value), 400),
    [],
  );

  return (
    <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-my-8">
      <div className="d-flex flex-row tw-w-[384px]">
        <SearchFieldWrapper
          onSubmit={onSubmitSearchField}
          onChange={handleSearchCoursesDebounced}
          value={cleanFilters ? '' : inputSearchValue}
          data-testid="input-filter-courses-search"
        />
      </div>

      <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
        <CoursesTypesFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} />
        <CoursesOrderFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} />
      </div>
    </div>
  );
};

CoursesFilters.defaultProps = {
  locationValue: '',
  onSubmitSearchField: () => {},
};

CoursesFilters.propTypes = {
  dispatch: PropTypes.func.isRequired,
  locationValue: PropTypes.string,
  onSubmitSearchField: PropTypes.func,
};

export default CoursesFilters;
