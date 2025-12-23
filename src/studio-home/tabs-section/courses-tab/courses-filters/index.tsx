import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SearchField } from '@openedx/paragon';
import { debounce } from 'lodash';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { Dispatch } from 'redux';

import { getStudioHomeCoursesParams } from '@src/studio-home/data/selectors';
import { updateStudioHomeCoursesCustomParams } from '@src/studio-home/data/slice';
import { fetchStudioHomeData } from '@src/studio-home/data/thunks';
import { LoadingSpinner } from '@src/generic/Loading';
import CoursesTypesFilterMenu from './courses-types-filter-menu';
import CoursesOrderFilterMenu from './courses-order-filter-menu';
import './index.scss';
import messages from './messages';
import { CourseImportFilter } from './courses-imported-filter-modal';

interface BaseFilter {
    currentPage: number;
    search: string | undefined;
    order: string | undefined;
    isFiltered: boolean;
    archivedOnly: boolean | undefined;
    activeOnly: boolean | undefined;
    cleanFilters: boolean;
}

/* regex to check if a string has only whitespace
  example "    "
*/
const regexOnlyWhiteSpaces = /^\s+$/;

interface Props {
  dispatch: Dispatch<any>,
  locationValue: string,
  onSubmitSearchField?: () => void,
  isLoading?: boolean,
};

const CoursesFilters = ({
  dispatch,
  locationValue = '',
  onSubmitSearchField,
  isLoading,
}: Props) => {
  const studioHomeCoursesParams = useSelector(getStudioHomeCoursesParams);
  const {
    order,
    search,
    activeOnly,
    archivedOnly,
    cleanFilters,
  } = studioHomeCoursesParams;
  const [inputSearchValue, setInputSearchValue] = useState('');

  const intl = useIntl();

  const getFilterTypeData = (baseFilters: BaseFilter) => ({
    archivedCourses: { ...baseFilters, archivedOnly: true, activeOnly: undefined },
    activeCourses: { ...baseFilters, activeOnly: true, archivedOnly: undefined },
    allCourses: { ...baseFilters, archivedOnly: undefined, activeOnly: undefined },
    azCourses: { ...baseFilters, order: 'display_name' },
    zaCourses: { ...baseFilters, order: '-display_name' },
    newestCourses: { ...baseFilters, order: '-created' },
    oldestCourses: { ...baseFilters, order: 'created' },
  });

  const handleMenuFilterItemSelected = (filterType: string | number) => {
    const baseFilters: BaseFilter = {
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

  const handleSearchCourses = (searchValueDebounced: string) => {
    const valueFormatted = searchValueDebounced.trim();
    const filterParams = {
      search: valueFormatted.length > 0 ? valueFormatted : '',
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

  const handleSearchCoursesDebounced = useCallback(
    debounce((value) => handleSearchCourses(value), 400),
    [activeOnly, archivedOnly, order, inputSearchValue],
  );

  return (
    <div className="d-flex">
      <div className="d-flex flex-row">
        <SearchField
          onSubmit={onSubmitSearchField}
          onChange={handleSearchCoursesDebounced}
          value={cleanFilters ? '' : inputSearchValue}
          className="mr-4"
          data-testid="input-filter-courses-search"
          placeholder={intl.formatMessage(messages.coursesSearchPlaceholder)}
        />
        {isLoading && (
          <span className="search-field-loading" data-testid="loading-search-spinner">
            <LoadingSpinner size="sm" />
          </span>
        )}
      </div>

      <CoursesTypesFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} />
      <CoursesOrderFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} />
      <CourseImportFilter />
    </div>
  );
};

export default CoursesFilters;
