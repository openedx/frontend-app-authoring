import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { COURSE_CREATOR_STATES } from '@src/constants';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { initialState } from '../../factories/mockApiResponses';

import CoursesTab from '.';
import { studioHomeCoursesRequestParamsDefault } from '../../data/slice';

const onClickNewCourse = jest.fn();
const isShowProcessing = false;
const isLoading = false;
const isFailed = false;
const numPages = 1;
const coursesCount = studioHomeMock.courses.length;
const showNewCourseContainer = true;

const renderComponent = (overrideProps = {}, studioHomeState = {}) => {
  // Generate a custom initial state based on studioHomeCoursesRequestParams
  const customInitialState: any = { // TODO: remove 'any' once our redux state has proper types
    ...initialState,
    studioHome: {
      ...initialState.studioHome,
      ...studioHomeState,
    },
  };

  // Initialize the store with the custom initial state
  const { reduxStore: store } = initializeMocks({ initialState: customInitialState });

  return {
    ...render(
      <CoursesTab
        coursesDataItems={studioHomeMock.courses}
        showNewCourseContainer={showNewCourseContainer}
        onClickNewCourse={onClickNewCourse}
        isShowProcessing={isShowProcessing}
        isLoading={isLoading}
        isFailed={isFailed}
        numPages={numPages}
        coursesCount={coursesCount}
        {...overrideProps}
      />,
    ),
    store,
  };
};

describe('<CoursesTab />', () => {
  it('should render correctly', async () => {
    renderComponent();
    const coursesPaginationInfo = screen.getByTestId('pagination-info');
    const coursesTypesMenu = screen.getByTestId('dropdown-toggle-course-type-menu');
    const coursesOrderMenu = screen.getByTestId('dropdown-toggle-courses-order-menu');
    const coursesFilterSearchInput = screen.getByTestId('input-filter-courses-search');
    expect(coursesPaginationInfo).toBeInTheDocument();
    expect(coursesTypesMenu).toBeInTheDocument();
    expect(coursesOrderMenu).toBeInTheDocument();
    expect(coursesFilterSearchInput).toBeInTheDocument();
  });

  it('should render loading spinner when isLoading is true and isFiltered is false', () => {
    const props = { isLoading: true, coursesDataItems: [] };
    const customStoreData = { studioHomeCoursesRequestParams: { currentPage: 1, isFiltered: true } };
    renderComponent(props, customStoreData);
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should render an error message when something went wrong', () => {
    const props = { isFailed: true };
    const customStoreData = { studioHomeCoursesRequestParams: { currentPage: 1, isFiltered: false } };
    renderComponent(props, customStoreData);
    const alertErrorFailed = screen.queryByTestId('error-failed-message');
    expect(alertErrorFailed).toBeInTheDocument();
  });

  it('should render an alert message when there is not courses found', () => {
    const props = { isLoading: false, coursesDataItems: [] };
    const customStoreData = { studioHomeCoursesRequestParams: { currentPage: 1, isFiltered: true } };
    renderComponent(props, customStoreData);
    const alertCoursesNotFound = screen.queryByTestId('courses-not-found-alert');
    expect(alertCoursesNotFound).toBeInTheDocument();
  });

  it('should render processing courses component when isEnabledPagination is false and isShowProcessing is true', () => {
    const props = { isShowProcessing: true, isEnabledPagination: false };
    const customStoreData = {
      studioHomeData: {
        inProcessCourseActions: [],
      },
      studioHomeCoursesRequestParams: {
        currentPage: 1,
        isFiltered: true,
      },
    };
    renderComponent(props, customStoreData);
    const alertCoursesNotFound = screen.queryByTestId('processing-courses-title');
    expect(alertCoursesNotFound).toBeInTheDocument();
  });

  it('should render CollapsibleStateWithAction when courseCreatorStatus is true', () => {
    const props = { isShowProcessing: true, isEnabledPagination: false };
    const customStoreData = {
      studioHomeData: {
        inProcessCourseActions: [],
        courseCreatorStatus: COURSE_CREATOR_STATES.denied,
      },
    };
    renderComponent(props, customStoreData);
    const collapsibleStateWithAction = screen.queryByTestId('collapsible-state-with-action');
    expect(collapsibleStateWithAction).toBeInTheDocument();
  });

  it('should reset filters when in pressed the button to clean them', () => {
    const props = { isLoading: false, coursesDataItems: [] };
    const customStoreData = { studioHomeCoursesRequestParams: { isFiltered: true } };
    const { store } = renderComponent(props, customStoreData);
    const cleanFiltersButton = screen.getByRole('button', { name: /clear filters/i });
    expect(cleanFiltersButton).toBeInTheDocument();

    fireEvent.click(cleanFiltersButton!);

    const state = store.getState();
    expect(state.studioHome.studioHomeCoursesRequestParams).toStrictEqual(studioHomeCoursesRequestParamsDefault);
  });
});
