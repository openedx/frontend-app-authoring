import { Routes, Route } from 'react-router-dom';
import { getConfig, setConfig } from '@edx/frontend-platform';

import { studioHomeMock } from '../__mocks__';
import messages from '../messages';
import tabMessages from './messages';
import TabsSection from '.';
import {
  initialState,
  generateGetStudioHomeDataApiResponse,
  generateGetStudioCoursesApiResponse,
  generateGetStudioCoursesApiResponseV2,
  generateGetStudioHomeLibrariesApiResponse,
} from '../factories/mockApiResponses';
import { getApiBaseUrl, getStudioHomeApiUrl } from '../data/api';
import { executeThunk } from '../../utils';
import { fetchLibraryData, fetchStudioHomeData } from '../data/thunks';
import { mockGetContentLibraryV2List } from '../../library-authoring/data/api.mocks';
import contentLibrariesListV2 from '../../library-authoring/__mocks__/contentLibrariesListV2';
import {
  initializeMocks,
  render as baseRender,
  fireEvent,
  screen,
  waitFor,
} from '../../testUtils';

const { studioShortName } = studioHomeMock;

let axiosMock;
let store;
const courseApiLink = `${getApiBaseUrl()}/api/contentstore/v1/home/courses`;
const courseApiLinkV2 = `${getApiBaseUrl()}/api/contentstore/v2/home/courses`;
const libraryApiLink = `${getApiBaseUrl()}/api/contentstore/v1/home/libraries`;

// The Libraries v2 tab title contains a badge, so we need to use regex to match its tab text.
const librariesBetaTabTitle = /Libraries Beta/;

const tabSectionComponent = (overrideProps) => (
  <TabsSection
    isPaginationCoursesEnabled={false}
    showNewCourseContainer={false}
    onClickNewCourse={() => {}}
    isShowProcessing
    librariesV1Enabled
    librariesV2Enabled
    {...overrideProps}
  />
);

const render = (overrideProps = {}) => baseRender(
  <Routes>
    <Route
      path="/home"
      element={tabSectionComponent(overrideProps)}
    />
    <Route
      path="/libraries"
      element={tabSectionComponent(overrideProps)}
    />
    <Route
      path="/libraries-v1"
      element={tabSectionComponent(overrideProps)}
    />
  </Routes>,
  { routerProps: { initialEntries: ['/home'] } },
);

describe('<TabsSection />', () => {
  beforeEach(() => {
    const newMocks = initializeMocks({ initialState });
    store = newMocks.reduxStore;
    axiosMock = newMocks.axiosMock;
    mockGetContentLibraryV2List.applyMock();
  });

  it('should render all tabs correctly', async () => {
    const data: any = generateGetStudioHomeDataApiResponse();
    data.archivedCourses = [{
      courseKey: 'course-v1:MachineLearning+123+2023',
      displayName: 'Machine Learning',
      lmsLink: '//localhost:18000/courses/course-v1:MachineLearning+123+2023/jump_to/block-v1:MachineLearning+123+2023+type@course+block@course',
      number: '123',
      org: 'LSE',
      rerunLink: '/course_rerun/course-v1:MachineLearning+123+2023',
      run: '2023',
      url: '/course/course-v1:MachineLearning+123+2023',
    }];

    render();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
    await executeThunk(fetchStudioHomeData(), store.dispatch);

    expect(screen.getByRole('tab', { name: tabMessages.coursesTabTitle.defaultMessage })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: librariesBetaTabTitle })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: tabMessages.legacyLibrariesTabTitle.defaultMessage })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: tabMessages.archivedTabTitle.defaultMessage })).toBeInTheDocument();
  });

  it('should render only 1 library tab when libraries-v2 disabled', async () => {
    const data = generateGetStudioHomeDataApiResponse();

    render({ librariesV2Enabled: false });
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
    await executeThunk(fetchStudioHomeData(), store.dispatch);

    expect(screen.getByText(tabMessages.librariesTabTitle.defaultMessage)).toBeInTheDocument();
    const librariesTab = screen.getByRole('tab', { name: tabMessages.librariesTabTitle.defaultMessage });
    expect(librariesTab).toBeInTheDocument();
    // Check Tab.eventKey
    expect(librariesTab).toHaveAttribute('data-rb-event-key', 'legacyLibraries');

    expect(screen.queryByText(tabMessages.legacyLibrariesTabTitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('should render only 1 library tab when libraries-v1 disabled', async () => {
    const data = generateGetStudioHomeDataApiResponse();

    render({ librariesV1Enabled: false });
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
    await executeThunk(fetchStudioHomeData(), store.dispatch);

    expect(screen.getByText(tabMessages.librariesTabTitle.defaultMessage)).toBeInTheDocument();
    const librariesTab = screen.getByRole('tab', { name: librariesBetaTabTitle });
    expect(librariesTab).toBeInTheDocument();
    // Check Tab.eventKey
    expect(librariesTab).toHaveAttribute('data-rb-event-key', 'libraries');

    expect(screen.queryByText(tabMessages.legacyLibrariesTabTitle.defaultMessage)).not.toBeInTheDocument();
  });

  describe('course tab', () => {
    it('should render specific course details', async () => {
      render();
      const data = generateGetStudioCoursesApiResponse();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(studioHomeMock.courses[0].displayName)).toBeVisible();

      expect(screen.getByText(
        `${studioHomeMock.courses[0].org} / ${studioHomeMock.courses[0].number} / ${studioHomeMock.courses[0].run}`,
      )).toBeVisible();
    });

    it('should render default sections when courses are empty', async () => {
      const data = generateGetStudioCoursesApiResponse();
      data.courses = [];

      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(`Are you staff on an existing ${studioShortName} course?`)).toBeInTheDocument();

      expect(screen.getByText(messages.defaultSection_1_Description.defaultMessage)).toBeInTheDocument();

      expect(screen.getByRole('button', { name: messages.defaultSection_2_Title.defaultMessage })).toBeInTheDocument();

      expect(screen.getByText(messages.defaultSection_2_Description.defaultMessage)).toBeInTheDocument();
    });

    it('should render course fetch failure alert', async () => {
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(404);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(tabMessages.courseTabErrorMessage.defaultMessage)).toBeVisible();
    });

    it('should render pagination when there are courses', async () => {
      render({ isPaginationCoursesEnabled: true });
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLinkV2).reply(200, generateGetStudioCoursesApiResponseV2());
      await executeThunk(fetchStudioHomeData('', true, {}, true), store.dispatch);
      const data = generateGetStudioCoursesApiResponseV2();
      const coursesLength = data.results.courses.length;
      const totalItems = data.count;
      const paginationInfoText = `Showing ${coursesLength} of ${totalItems}`;

      expect(screen.getByText(studioHomeMock.courses[0].displayName)).toBeVisible();

      const pagination = screen.getByRole('navigation');
      const paginationInfo = screen.getByTestId('pagination-info');
      expect(paginationInfo.textContent).toContain(paginationInfoText);
      expect(pagination).toBeVisible();
    });

    it('should not render pagination when there are not courses', async () => {
      const data = generateGetStudioCoursesApiResponseV2();
      data.results.courses = [];
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLinkV2).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const pagination = screen.queryByRole('navigation');
      expect(pagination).not.toBeInTheDocument();
    });

    it('should set the url path to "/home" when switching away then back to courses tab', async () => {
      const data = generateGetStudioCoursesApiResponseV2();
      data.results.courses = [];
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLinkV2).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      // confirm the url path is initially /home
      waitFor(() => {
        expect(window.location.href).toContain('/home');
      });

      // switch to libraries tab
      axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      await executeThunk(fetchLibraryData(), store.dispatch);
      const librariesTab = screen.getByText(tabMessages.legacyLibrariesTabTitle.defaultMessage);
      fireEvent.click(librariesTab);

      // confirm that the url path has changed
      expect(librariesTab).toHaveClass('active');
      waitFor(() => {
        expect(window.location.href).toContain('/libraries-v1');
      });

      // switch back to courses tab
      const coursesTab = screen.getByText(tabMessages.coursesTabTitle.defaultMessage);
      fireEvent.click(coursesTab);

      // confirm that the url path is /home
      expect(coursesTab).toHaveClass('active');
      waitFor(() => {
        expect(window.location.href).toContain('/home');
      });
    });
  });

  describe('taxonomies tab', () => {
    it('should not show taxonomies tab on page if not enabled', async () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
      });

      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(tabMessages.coursesTabTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.queryByText(tabMessages.taxonomiesTabTitle.defaultMessage)).toBeNull();
    });

    it('should redirect to taxonomies page', async () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });

      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const taxonomiesTab = screen.getByText(tabMessages.taxonomiesTabTitle.defaultMessage);
      fireEvent.click(taxonomiesTab);

      waitFor(() => {
        expect(window.location.href).toContain('/taxonomies');
      });
    });
  });

  describe('archived tab', () => {
    it('should switch to Archived tab and render specific archived course details', async () => {
      render();
      const data = generateGetStudioCoursesApiResponse();
      data.archivedCourses = studioHomeMock.archivedCourses;
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const archivedTab = screen.getByText(tabMessages.archivedTabTitle.defaultMessage);
      fireEvent.click(archivedTab);

      expect(screen.getByText(studioHomeMock.archivedCourses[0].displayName)).toBeVisible();

      expect(screen.getByText(
        `${studioHomeMock.archivedCourses[0].org} / ${studioHomeMock.archivedCourses[0].number} / ${studioHomeMock.archivedCourses[0].run}`,
      )).toBeVisible();
    });

    it('should hide Archived tab when archived courses are empty', async () => {
      const data = generateGetStudioCoursesApiResponse();
      data.archivedCourses = [];

      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByRole('tab', { name: tabMessages.coursesTabTitle.defaultMessage })).toBeInTheDocument();

      expect(screen.getByRole('tab', { name: librariesBetaTabTitle })).toBeInTheDocument();

      expect(screen.getByRole('tab', { name: tabMessages.legacyLibrariesTabTitle.defaultMessage })).toBeInTheDocument();

      expect(screen.queryByRole('tab', { name: tabMessages.archivedTabTitle.defaultMessage })).toBeNull();
    });
  });

  describe('library tab', () => {
    beforeEach(() => {
      axiosMock.onGet(courseApiLink).reply(200, generateGetStudioCoursesApiResponse());
    });
    it('should switch to Legacy Libraries tab and render specific v1 library details', async () => {
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);
      await executeThunk(fetchLibraryData(), store.dispatch);

      const librariesTab = screen.getByText(tabMessages.legacyLibrariesTabTitle.defaultMessage);
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(studioHomeMock.libraries[0].displayName)).toBeVisible();

      expect(screen.getByText(`${studioHomeMock.libraries[0].org} / ${studioHomeMock.libraries[0].number}`)).toBeVisible();
    });

    it('should switch to Libraries tab and render specific v2 library details', async () => {
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = screen.getByRole('tab', { name: librariesBetaTabTitle });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(screen.getByText('Showing 2 of 2')).toBeVisible();

      expect(screen.getByText(contentLibrariesListV2.results[0].title)).toBeVisible();
      expect(screen.getByText(
        `${contentLibrariesListV2.results[0].org} / ${contentLibrariesListV2.results[0].slug}`,
      )).toBeVisible();

      expect(screen.getByText(contentLibrariesListV2.results[1].title)).toBeVisible();
      expect(screen.getByText(
        `${contentLibrariesListV2.results[1].org} / ${contentLibrariesListV2.results[1].slug}`,
      )).toBeVisible();
    });

    it('should switch to Libraries tab and render specific v1 library details ("v1 only" mode)', async () => {
      render({ librariesV2Enabled: false });
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);
      await executeThunk(fetchLibraryData(), store.dispatch);

      // Libraries v2 tab should not be shown
      expect(screen.queryByRole('tab', { name: librariesBetaTabTitle })).toBeNull();

      const librariesTab = screen.getByRole('tab', { name: tabMessages.librariesTabTitle.defaultMessage });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(studioHomeMock.libraries[0].displayName)).toBeVisible();

      expect(screen.getByText(`${studioHomeMock.libraries[0].org} / ${studioHomeMock.libraries[0].number}`)).toBeVisible();
    });

    it('should switch to Libraries tab and render specific v2 library details ("v2 only" mode)', async () => {
      render({ librariesV1Enabled: false });
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      // Libraries v1 tab should not be shown
      expect(screen.queryByText(tabMessages.legacyLibrariesTabTitle.defaultMessage)).toBeNull();

      const librariesTab = screen.getByRole('tab', { name: librariesBetaTabTitle });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(screen.getByText('Showing 2 of 2')).toBeVisible();
      expect(screen.getByText('Page 1, Current Page, of 2')).toBeVisible();

      expect(screen.getByText(contentLibrariesListV2.results[0].title)).toBeVisible();
      expect(screen.getByText(
        `${contentLibrariesListV2.results[0].org} / ${contentLibrariesListV2.results[0].slug}`,
      )).toBeVisible();

      expect(screen.getByText(contentLibrariesListV2.results[1].title)).toBeVisible();
      expect(screen.getByText(
        `${contentLibrariesListV2.results[1].org} / ${contentLibrariesListV2.results[1].slug}`,
      )).toBeVisible();
    });

    it('should show a "not found" message if no v2 libraries were loaded', async () => {
      mockGetContentLibraryV2List.applyMockEmpty();
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = screen.getByRole('tab', { name: librariesBetaTabTitle });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(
        tabMessages.librariesV2TabLibraryNotFoundAlertMessage.defaultMessage,
      )).toBeVisible();
    });

    it('should hide Libraries tab when libraries are disabled', async () => {
      const data = generateGetStudioHomeDataApiResponse();

      render({ librariesV1Enabled: false });
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(tabMessages.coursesTabTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.queryByText(tabMessages.legacyLibrariesTabTitle.defaultMessage)).toBeNull();
    });

    it('should render legacy libraries fetch failure alert', async () => {
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(libraryApiLink).reply(404);
      await executeThunk(fetchStudioHomeData(), store.dispatch);
      await executeThunk(fetchLibraryData(), store.dispatch);

      const librariesTab = screen.getByText(tabMessages.legacyLibrariesTabTitle.defaultMessage);
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(tabMessages.librariesTabErrorMessage.defaultMessage)).toBeVisible();
    });

    it('should render v2 libraries fetch failure alert', async () => {
      mockGetContentLibraryV2List.applyMockError();
      render();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = screen.getByRole('tab', { name: librariesBetaTabTitle });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(
        tabMessages.librariesTabErrorMessage.defaultMessage,
      )).toBeVisible();
    });
  });
});
