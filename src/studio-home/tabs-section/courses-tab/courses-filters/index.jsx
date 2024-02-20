import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { SearchField } from '@edx/paragon';
import { getStudioHomeCoursesParams } from '../../../data/selectors';
import { updateStudioHomeCoursesCustomParams } from '../../../data/slice';
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

  const handleSearchCourses = (value) => {
    const isSearchEmpty = !value.trim().length;

    const params = {
      page: isSearchEmpty ? 1 : currentPage,
      search: isSearchEmpty ? undefined : value,
      activeOnly,
      archivedOnly,
      order,
      isFiltered: true,
    };

    dispatch(updateStudioHomeCoursesCustomParams(params));
  };

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
