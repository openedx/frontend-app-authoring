import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { SearchField } from '@openedx/paragon';
import { getStudioHomeCoursesParams } from '../../../data/selectors';
import { updateStudioHomeCoursesCustomParams } from '../../../data/slice';
import { useDebounce } from '../../../../hooks';
import CoursesTypesFilterMenu from './courses-types-filter-menu';
import CoursesOrderFilterMenu from './courses-order-filter-menu';

const CoursesFilters = ({ dispatch }) => {
  const {
    order,
    search,
    activeOnly,
    archivedOnly,
    cleanFilters,
  } = useSelector(getStudioHomeCoursesParams);
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
    dispatch(updateStudioHomeCoursesCustomParams(filterParamsFormat));
  };

  useEffect(() => {
    const loadCoursesSearched = () => {
      const valueFormatted = searchValueDebounced.trim();
      dispatch(updateStudioHomeCoursesCustomParams({
        page: 1,
        search: valueFormatted,
        activeOnly,
        archivedOnly,
        order,
        isFiltered: true,
        cleanFilters: false,
      }));
    };

    const hasSearchValueDebouncedValue = searchValueDebounced.trim().length;

    if (hasSearchValueDebouncedValue) {
      loadCoursesSearched();
    }
  }, [searchValueDebounced]);

  useEffect(() => {
    const isInputSearchEmpty = inputSearchValue.trim().length;
    if (!isInputSearchEmpty) {
      dispatch(updateStudioHomeCoursesCustomParams({
        page: 1,
        activeOnly,
        archivedOnly,
        order,
        isFiltered: true,
        cleanFilters: false,
      }));
    }
  }, [inputSearchValue]);

  return (
    <div className="d-flex">
      <SearchField
        onSubmit={() => null}
        onChange={handleSearchCourses}
        value={cleanFilters ? '' : inputSearchValue}
        className="mr-4"
        data-testid="input-filter-courses-search"
        placeholder="Search"
      />

      <CoursesTypesFilterMenu
        onItemMenuSelected={handleMenuFilterItemSelected}
      />

      <CoursesOrderFilterMenu
        onItemMenuSelected={handleMenuFilterItemSelected}
      />
    </div>
  );
};

CoursesFilters.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default CoursesFilters;
