import { Routes, Route, useLocation } from 'react-router-dom';
import { getConfig, setConfig } from '@edx/frontend-platform';

import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { userEvent } from '@testing-library/user-event';
import { executeThunk } from '@src/utils';
import { mockGetContentLibraryV2List } from '@src/library-authoring/data/api.mocks';
import contentLibrariesListV2 from '@src/library-authoring/__mocks__/contentLibrariesListV2';
import {
  initializeMocks,
  render as baseRender,
  fireEvent,
  screen,
  act,
  within,
} from '@src/testUtils';
import messages from '../messages';
import tabMessages from './messages';
import TabsSection from '.';
import {
  initialState,
  generateGetStudioHomeDataApiResponse,
  generateGetStudioCoursesApiResponseV2,
  generateGetStudioHomeLibrariesApiResponse,
} from '../factories/mockApiResponses';
import { getApiBaseUrl, getStudioHomeApiUrl } from '../data/api';
import { fetchStudioHomeData } from '../data/thunks';

const { studioShortName } = studioHomeMock;

let axiosMock;
let store;
const courseApiLinkV2 = `${getApiBaseUrl()}/api/contentstore/v2/home/courses`;
const libraryApiLink = `${getStudioHomeApiUrl()}/libraries`;

// The Libraries v2 tab title contains a badge, so we need to use regex to match its tab text.
const librariesBetaTabTitle = /Libraries Beta/;

const tabSectionComponent = (overrideProps) => (
  <TabsSection
    showNewCourseContainer={false}
    onClickNewCourse={() => {}}
    isShowProcessing
    librariesV1Enabled
    librariesV2Enabled
    {...overrideProps}
  />
);

export const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
};

const render = (overrideProps = {}) => baseRender(
  <>
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
    </Routes>
    <LocationDisplay />
  </>,
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

    render();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
    await executeThunk(fetchStudioHomeData(), store.dispatch);

    expect(screen.getByRole('tab', { name: tabMessages.coursesTabTitle.defaultMessage })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: librariesBetaTabTitle })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: tabMessages.legacyLibrariesTabTitle.defaultMessage })).toBeInTheDocument();
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
      const data = generateGetStudioCoursesApiResponseV2();
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(courseApiLinkV2).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(studioHomeMock.courses[0].displayName)).toBeVisible();

      expect(screen.getByText(
        `${studioHomeMock.courses[0].org} / ${studioHomeMock.courses[0].number} / ${studioHomeMock.courses[0].run}`,
      )).toBeVisible();
    });

    it('should render default sections when courses are empty', async () => {
      const data = generateGetStudioCoursesApiResponseV2();
      data.results.courses = [];

      render();
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(courseApiLinkV2).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(`Are you staff on an existing ${studioShortName} course?`)).toBeInTheDocument();

      expect(screen.getByText(messages.defaultSection_1_Description.defaultMessage)).toBeInTheDocument();

      expect(screen.getByRole('button', { name: messages.defaultSection_2_Title.defaultMessage })).toBeInTheDocument();

      expect(screen.getByText(messages.defaultSection_2_Description.defaultMessage)).toBeInTheDocument();
    });

    it('should render course fetch failure alert', async () => {
      render();
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(courseApiLinkV2).reply(404);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(tabMessages.courseTabErrorMessage.defaultMessage)).toBeVisible();
    });

    it('should render pagination when there are courses', async () => {
      render({ isPaginationCoursesEnabled: true });
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(courseApiLinkV2).reply(200, generateGetStudioCoursesApiResponseV2());
      await executeThunk(fetchStudioHomeData('', true, {}), store.dispatch);
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
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(courseApiLinkV2).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const pagination = screen.queryByRole('navigation');
      expect(pagination).not.toBeInTheDocument();
    });

    it('should set the url path to home when switching away then back to courses tab', async () => {
      const data = generateGetStudioCoursesApiResponseV2();
      data.results.courses = [];
      await axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(courseApiLinkV2).reply(200, data);
      render();
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      // confirm the url path is initially /home
      const firstLocationDisplay = await screen.findByTestId('location-display');
      expect(firstLocationDisplay).toHaveTextContent('/home');

      // switch to libraries tab
      const librariesTab = screen.getByText(tabMessages.legacyLibrariesTabTitle.defaultMessage);
      fireEvent.click(librariesTab);

      // confirm that the url path has changed
      expect(librariesTab).toHaveClass('active');
      const secondLocationDisplay = await screen.findByTestId('location-display');
      expect(secondLocationDisplay).toHaveTextContent('/libraries-v1');

      // switch back to courses tab
      const coursesTab = screen.getByText(tabMessages.coursesTabTitle.defaultMessage);
      fireEvent.click(coursesTab);

      // confirm that the url path is /home
      expect(coursesTab).toHaveClass('active');
      const thirdLocationDisplay = await screen.findByTestId('location-display');
      expect(thirdLocationDisplay).toHaveTextContent('/home');
    });
  });

  describe('taxonomies tab', () => {
    it('should not show taxonomies tab on page if not enabled', async () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
      });

      render();
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      await screen.findByText(tabMessages.coursesTabTitle.defaultMessage);
      expect(screen.queryByText(tabMessages.taxonomiesTabTitle.defaultMessage)).toBeNull();
    });

    it('should redirect to taxonomies page', async () => {
      setConfig({
        ...getConfig(),
        ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      });

      render();
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const taxonomiesTab = await screen.findByText(tabMessages.taxonomiesTabTitle.defaultMessage);
      fireEvent.click(taxonomiesTab);

      const locationDisplay = await screen.findByTestId('location-display');
      expect(locationDisplay).toHaveTextContent('/taxonomies');
    });
  });

  describe('library tab', () => {
    beforeEach(async () => {
      await axiosMock.onGet(courseApiLinkV2).reply(200, generateGetStudioCoursesApiResponseV2());
    });
    it('should switch to Legacy Libraries tab and render - search and filter should work as expected', async () => {
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      render();
      const user = userEvent.setup();
      await act(async () => executeThunk(fetchStudioHomeData(), store.dispatch));

      const librariesTab = await screen.findByText(tabMessages.legacyLibrariesTabTitle.defaultMessage);
      await user.click(librariesTab);

      expect(librariesTab).toHaveClass('active');
      const panel = await screen.findByRole('tabpanel', { hidden: false });

      expect(await screen.findByText(studioHomeMock.libraries[0].displayName)).toBeVisible();

      expect(
        await screen.findByText(`${studioHomeMock.libraries[0].org} / ${studioHomeMock.libraries[0].number}`),
      ).toBeVisible();

      // Migration info should be displayed
      const migratedContent = generateGetStudioHomeLibrariesApiResponse().libraries[1];
      expect(await screen.findByText(migratedContent.displayName)).toBeVisible();
      const newTitleElement = await screen.findAllByText(migratedContent.migratedToTitle!);
      expect(newTitleElement[0]).toBeVisible();
      expect(newTitleElement[0]).toHaveAttribute('href', `/library/${migratedContent.migratedToKey}`);
      expect(newTitleElement[1]).toHaveAttribute(
        'href',
        `/library/${migratedContent.migratedToKey}/collection/${migratedContent.migratedToCollectionKey}`,
      );

      // Check total count display
      expect(await within(panel).findByText('Showing 3 of 3')).toBeInTheDocument();

      // Test search functionality
      const searchField = await within(panel).findByPlaceholderText('Search');

      fireEvent.change(searchField, { target: { value: 'Legacy' } });
      // Should only show 1 result i.e. migratedContent.displayName
      expect(await within(panel).findByText('Showing 1 of 3')).toBeInTheDocument();
      expect(await within(panel).findByText(migratedContent.displayName)).toBeVisible();
      // Should not show other items.
      expect(within(panel).queryByText(
        generateGetStudioHomeLibrariesApiResponse().libraries[0].displayName,
      )).not.toBeInTheDocument();
      // reset search
      fireEvent.change(searchField, { target: { value: '' } });

      // Test migration filter
      const filter = await within(panel).findByRole('button', { name: 'Any Migration Status' });
      await user.click(filter);
      let migratedOption = await within(panel).findByRole('checkbox', { name: 'Migrated' });
      // This should uncheck Migrated option as all options are selected by default
      await user.click(migratedOption);
      // Should only show 2 result i.e. unmigrated libraries
      expect(await within(panel).findByText('Showing 2 of 3')).toBeInTheDocument();
      // test clearing filter
      const clearFilter = await within(panel).findByRole('button', { name: 'Clear Filter' });
      await user.click(clearFilter);
      // Should show all 3 results
      expect(await within(panel).findByText('Showing 3 of 3')).toBeInTheDocument();
      // Open the filter again
      await user.click(filter);
      // Reload migratedOption as clearing and opening the filter again creates a new modal
      migratedOption = await within(panel).findByRole('checkbox', { name: 'Migrated' });
      const unmigratedOption = await within(panel).findByRole('checkbox', { name: 'Unmigrated' });
      // both options should be selected by default - even after clearing
      expect(migratedOption).toBeChecked();
      expect(unmigratedOption).toBeChecked();
      // Un-checking both options should reset the state to both checked.
      await user.click(unmigratedOption);
      await user.click(migratedOption);
      expect(migratedOption).toBeChecked();
      expect(unmigratedOption).toBeChecked();
      // Should show all 3 results
      expect(await within(panel).findByText('Showing 3 of 3')).toBeInTheDocument();
    });

    it('should switch to Libraries tab and render specific v2 library details', async () => {
      render();
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = await screen.findByRole('tab', { name: librariesBetaTabTitle });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      await screen.findByText('Showing 2 of 2');

      expect(screen.getByText(contentLibrariesListV2.results[0].title)).toBeVisible();
      expect(screen.getByText(
        `${contentLibrariesListV2.results[0].org} / ${contentLibrariesListV2.results[0].slug}`,
      )).toBeVisible();

      expect(screen.getByText(contentLibrariesListV2.results[1].title)).toBeVisible();
      expect(screen.getByText(
        `${contentLibrariesListV2.results[1].org} / ${contentLibrariesListV2.results[1].slug}`,
      )).toBeVisible();
    });

    it('should switch to Libraries tab and render specific v1 library details - v1 only mode', async () => {
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      render({ librariesV2Enabled: false });
      const user = userEvent.setup();
      await act(async () => executeThunk(fetchStudioHomeData(), store.dispatch));

      // Libraries v2 tab should not be shown
      expect(screen.queryByRole('tab', { name: librariesBetaTabTitle })).toBeNull();

      const librariesTab = await screen.findByRole('tab', { name: tabMessages.librariesTabTitle.defaultMessage });
      await user.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(studioHomeMock.libraries[0].displayName)).toBeVisible();

      expect(
        await screen.findByText(`${studioHomeMock.libraries[0].org} / ${studioHomeMock.libraries[0].number}`),
      ).toBeVisible();
    });

    it('should open migration library page from v1 libraries tab', async () => {
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      render({ librariesV2Enabled: false });
      const user = userEvent.setup();
      await act(async () => executeThunk(fetchStudioHomeData(), store.dispatch));

      // Libraries v2 tab should not be shown
      expect(screen.queryByRole('tab', { name: librariesBetaTabTitle })).toBeNull();

      const librariesTab = await screen.findByRole('tab', { name: tabMessages.librariesTabTitle.defaultMessage });
      await user.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(studioHomeMock.libraries[0].displayName)).toBeVisible();

      const migratorButton = screen.getByRole('button', { name: /review legacy libraries/i });
      expect(migratorButton).toBeInTheDocument();
      await user.click(migratorButton);

      const locationDisplay = await screen.findByTestId('location-display');
      expect(locationDisplay).toHaveTextContent('/migrate');
    });

    it('should open migration library page from v2 libraries tab', async () => {
      const libraries = generateGetStudioHomeLibrariesApiResponse().libraries.map(
        library => ({
          ...library,
          isMigrated: false,
        }),
      );
      const user = userEvent.setup();
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeLibrariesApiResponse());
      await axiosMock.onGet(libraryApiLink).reply(200, { libraries });
      render();
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = await screen.findByRole('tab', { name: librariesBetaTabTitle });
      await user.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(/welcome to the new content libraries/i)).toBeVisible();

      const migratorButton = screen.getByRole('button', { name: /review legacy libraries/i });
      expect(migratorButton).toBeInTheDocument();
      await user.click(migratorButton);

      const locationDisplay = await screen.findByTestId('location-display');
      expect(locationDisplay).toHaveTextContent('/migrate');
    });

    it('should switch to Libraries tab and render specific v2 library details ("v2 only" mode)', async () => {
      render({ librariesV1Enabled: false });
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      // Libraries v1 tab should not be shown
      expect(screen.queryByText(tabMessages.legacyLibrariesTabTitle.defaultMessage)).toBeNull();

      const librariesTab = await screen.findByRole('tab', { name: librariesBetaTabTitle });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      await screen.findByText('Showing 2 of 2');
      expect(screen.getAllByText('Page 1, Current Page, of 2')[0]).toBeVisible();

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
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = await screen.findByRole('tab', { name: librariesBetaTabTitle });
      fireEvent.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(
        tabMessages.librariesV2TabLibraryNotFoundAlertMessage.defaultMessage,
      )).toBeVisible();
    });

    it('should hide Libraries tab when libraries are disabled', async () => {
      const data = generateGetStudioHomeDataApiResponse();

      render({ librariesV1Enabled: false });
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      await screen.findByText(tabMessages.coursesTabTitle.defaultMessage);
      expect(screen.queryByText(tabMessages.legacyLibrariesTabTitle.defaultMessage)).toBeNull();
    });

    it('should render legacy libraries fetch failure alert', async () => {
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      await axiosMock.onGet(libraryApiLink).reply(404);
      render();
      const user = userEvent.setup();
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = await screen.findByText(tabMessages.legacyLibrariesTabTitle.defaultMessage);
      await user.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(tabMessages.librariesTabErrorMessage.defaultMessage)).toBeVisible();
    });

    it('should render v2 libraries fetch failure alert', async () => {
      mockGetContentLibraryV2List.applyMockError();
      await axiosMock.onGet(libraryApiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
      await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      render();
      const user = userEvent.setup();
      await act(async () => executeThunk(fetchStudioHomeData(), store.dispatch));

      const librariesTab = await screen.findByRole('tab', { name: librariesBetaTabTitle });
      await user.click(librariesTab);

      expect(librariesTab).toHaveClass('active');

      expect(await screen.findByText(
        tabMessages.librariesTabErrorMessage.defaultMessage,
      )).toBeVisible();
    });

    [true, false].forEach((isMigrated) => {
      it(`should render v2 libraries migration alert when the libraries have isMigrated=${isMigrated}`, async () => {
        const libraries = generateGetStudioHomeLibrariesApiResponse().libraries.map(
          library => ({
            ...library,
            isMigrated,
          }),
        );
        const user = userEvent.setup();
        await axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeLibrariesApiResponse());
        await axiosMock.onGet(libraryApiLink).reply(200, { libraries });
        render();
        await executeThunk(fetchStudioHomeData(), store.dispatch);

        const librariesTab = await screen.findByRole('tab', { name: librariesBetaTabTitle });
        await user.click(librariesTab);

        expect(librariesTab).toHaveClass('active');

        expect(await screen.findByText(/welcome to the new content libraries/i)).toBeVisible();

        const migrationPendingText = /legacy libraries can be migrated using the migration tool/i;

        if (isMigrated) {
          expect(screen.queryByText(migrationPendingText)).not.toBeInTheDocument();
          expect(screen.queryByRole('button', { name: 'Review Legacy Libraries' })).not.toBeInTheDocument();
        } else {
          expect(screen.getByText(migrationPendingText)).toBeVisible();
          expect(screen.getByRole('button', { name: 'Review Legacy Libraries' })).toBeVisible();
        }
      });
    });
  });
});
