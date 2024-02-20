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
    currentPage,
    order,
    search,
    activeOnly,
    archivedOnly,
  } = useSelector(getStudioHomeCoursesParams);
  const [inputSearchValue, setInputSearchValue] = useState('');
  const searchValueDebounced = useDebounce(inputSearchValue);

  const handleSearchCourses = (value) => setInputSearchValue(value);

  const getFilterTypeData = (baseFilters) => ({
    archivedCourses: { ...baseFilters, archivedOnly: true },
    activeCourses: { ...baseFilters, activeOnly: true },
    allCourses: { ...baseFilters },
    azCourses: { ...baseFilters, order: 'display_name' },
    zaCourses: { ...baseFilters, order: '-display_name' },
    newestCourses: { ...baseFilters, order: '-created' },
    oldestCourses: { ...baseFilters, order: 'created' },
  });

  const handleMenuFilterItemSelected = (filterType) => {
    const baseFilters = {
      page: currentPage,
      search,
      order,
      isFiltered: true,
    };

    const filterParams = getFilterTypeData(baseFilters);
    const filterParamsFormat = filterParams[filterType] || baseFilters;
    dispatch(updateStudioHomeCoursesCustomParams(filterParamsFormat));
  };

  useEffect(() => {
    const loadCoursesSearched = () => {
      const valueFormatted = searchValueDebounced.trim();
      const isSearchEmpty = !valueFormatted.length;

      const params = {
        page: isSearchEmpty ? 1 : currentPage,
        search: isSearchEmpty ? undefined : valueFormatted,
        activeOnly,
        archivedOnly,
        order,
        isFiltered: true,
      };

      dispatch(updateStudioHomeCoursesCustomParams(params));
    };

    loadCoursesSearched();
  }, [searchValueDebounced]);

  return (
    <div className="d-flex">
      <SearchField
        onSubmit={() => null}
        onChange={handleSearchCourses}
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
