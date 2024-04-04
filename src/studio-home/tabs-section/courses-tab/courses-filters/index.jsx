import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { SearchField } from '@openedx/paragon';
import { getStudioHomeCoursesParams } from '../../../data/selectors';
import { updateStudioHomeCoursesCustomParams } from '../../../data/slice';
import { fetchStudioHomeData } from '../../../data/thunks';
import { useDebounce } from '../../../../hooks';
import CoursesTypesFilterMenu from './courses-types-filter-menu';
import CoursesOrderFilterMenu from './courses-order-filter-menu';

const CoursesFilters = ({ dispatch, locationValue }) => {
  const studioHomeCoursesParams = useSelector(getStudioHomeCoursesParams);
  const {
    order,
    search,
    activeOnly,
    archivedOnly,
    cleanFilters,
  } = studioHomeCoursesParams;
  const [inputSearchValue, setInputSearchValue] = useState('');
  const searchValueDebounced = useDebounce(inputSearchValue);

  const handleSearchCourses = (value) => {
    setInputSearchValue(value);
  };

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

  const handleClearSearchInput = () => {
    const filterParams = {
      search: undefined,
      activeOnly,
      archivedOnly,
      order,
    };

    dispatch(updateStudioHomeCoursesCustomParams({
      currentPage: 1,
      isFiltered: true,
      cleanFilters: false,
      inputValue: '',
      ...filterParams,
    }));

    dispatch(fetchStudioHomeData(locationValue, false, { page: 1, ...filterParams }, true));
  };

  useEffect(() => {
    const debouncedCleanedSearchValue = searchValueDebounced.trim();
    const loadCoursesSearched = () => {
      const valueFormatted = debouncedCleanedSearchValue;
      const filterParams = {
        search: valueFormatted,
        activeOnly,
        archivedOnly,
        order,
      };
      dispatch(updateStudioHomeCoursesCustomParams({
        currentPage: 1,
        isFiltered: true,
        cleanFilters: false,
        inputValue: searchValueDebounced,
        ...filterParams,
      }));

      if (valueFormatted !== search) {
        dispatch(fetchStudioHomeData(locationValue, false, { page: 1, ...filterParams }, true));
      }
    };

    const hasSearchValueDebouncedValue = debouncedCleanedSearchValue.length;

    if (hasSearchValueDebouncedValue) {
      loadCoursesSearched();
    }
  }, [searchValueDebounced]);

  return (
    <div className="d-flex">
      <SearchField
        onSubmit={() => null}
        onChange={handleSearchCourses}
        value={cleanFilters ? '' : inputSearchValue}
        className="mr-4"
        data-testid="input-filter-courses-search"
        placeholder="Search"
        onClear={handleClearSearchInput}
      />

      <CoursesTypesFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} />
      <CoursesOrderFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} />
    </div>
  );
};

CoursesFilters.defaultProps = {
  locationValue: '',
};

CoursesFilters.propTypes = {
  dispatch: PropTypes.func.isRequired,
  locationValue: PropTypes.string,
};

export default CoursesFilters;
