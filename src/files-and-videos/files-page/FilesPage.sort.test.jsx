import {
  render,
  fireEvent,
  screen,
  waitFor,
  initializeMocks,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { executeThunk } from '@src/utils';
import { fetchAssets } from './data/thunks';
import { getAssetsUrl } from './data/api';
import { courseId, initialState } from './factories/mockApiResponses';
import FilesPage from './FilesPage';
import messages from '../generic/messages';

let axiosMock;
let store;

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn().mockReturnValue({
    isLoading: false,
    canViewFiles: true,
    canEditFiles: true,
    canDeleteFiles: true,
    canCreateFiles: true,
  }),
}));

const renderComponent = () => {
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <FilesPage />
    </CourseAuthoringProvider>,
    {
      path: '/course/:courseId/*',
      routerProps: { initialEntries: [`/course/${courseId}/files`] },
      params: { courseId },
    },
  );
};

// Custom fixture, deliberately built to exercise BOTH bugs at once:
// - fileTiedA / fileTiedB share the exact same minute-precision timestamp
//   (the same-minute tiebreaker scenario, e.g. file8/file9).
// - fileOlderWeekday / fileNewerWeekday are genuinely different dates that
//   fall on weekdays whose abbreviations sort "backwards" alphabetically
//   (Tue vs Mon), covering the weekday-string regression.
const customAssets = () => ({
  assets: [
    {
      id: 'fileTiedA',
      displayName: 'file8.rtf',
      locked: false,
      externalUrl: '',
      portableUrl: '',
      contentType: 'application/rtf',
      dateAdded: 'Jul 08, 2026 at 00:11 UTC',
      thumbnail: null,
      fileSize: 100,
      usageLocations: [],
    },
    {
      id: 'fileTiedB',
      displayName: 'file9.rtf',
      locked: false,
      externalUrl: '',
      portableUrl: '',
      contentType: 'application/rtf',
      dateAdded: 'Jul 08, 2026 at 00:11 UTC', // identical minute to fileTiedA
      thumbnail: null,
      fileSize: 100,
      usageLocations: [],
    },
    {
      id: 'fileOlderWeekday',
      displayName: 'older.rtf',
      locked: false,
      externalUrl: '',
      portableUrl: '',
      contentType: 'application/rtf',
      dateAdded: 'Jun 02, 2026 at 10:00 UTC', // a Tuesday, genuinely older
      thumbnail: null,
      fileSize: 100,
      usageLocations: [],
    },
    {
      id: 'fileNewerWeekday',
      displayName: 'newer.rtf',
      locked: false,
      externalUrl: '',
      portableUrl: '',
      contentType: 'application/rtf',
      dateAdded: 'Jun 08, 2026 at 10:00 UTC', // a Monday, genuinely 6 days newer
      thumbnail: null,
      fileSize: 100,
      usageLocations: [],
    },
  ],
});

const mockStoreWithCustomAssets = async () => {
  const fetchAssetsUrl = `${getAssetsUrl(courseId)}?page=0`;
  axiosMock.onGet(fetchAssetsUrl).reply(200, customAssets());
  const nextPageUrl = `${getAssetsUrl(courseId)}?page=1`;
  axiosMock.onGet(nextPageUrl).reply(200, { assets: [] });

  renderComponent();
  await executeThunk(fetchAssets(courseId), store.dispatch);

  await waitFor(() => {
    expect(screen.getAllByTestId(/^grid-card-/)).toHaveLength(4);
  });
};

// Reads the currently rendered file card order directly from the DOM,
// by id, in the order they actually appear on screen — this is the
// integration-test difference from the unit tests: it doesn't call
// sortFiles() directly, it checks what the USER would actually see.
const getRenderedCardOrder = () => screen.getAllByTestId(/^grid-card-/)
  .map(card => card.getAttribute('data-testid').replace('grid-card-', ''));

const openSortModalAndApply = async (sortOptionLabel) => {
  fireEvent.click(screen.getByText(messages.sortButtonLabel.defaultMessage));
  await waitFor(() => {
    expect(screen.getByText(messages.sortModalTitleLabel.defaultMessage)).toBeVisible();
  });
  fireEvent.click(screen.getByText(sortOptionLabel));
  fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
  await waitFor(() => {
    expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
  });
};

describe('FilesPage sort integration', () => {
  beforeEach(() => {
    const mocks = initializeMocks({ initialState });
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    global.localStorage.clear();
  });

  it('renders tied and non-tied files in correct, direction-consistent order', async () => {
    await mockStoreWithCustomAssets();

    // --- Newest first ---
    await openSortModalAndApply(messages.sortByNewest.defaultMessage);
    const newestOrder = getRenderedCardOrder();

    // The genuinely newer weekday file should render before the genuinely
    // older one -- this is the regression check for the weekday-string bug.
    // Under the old .toString()-based code, this assertion would fail.
    expect(newestOrder.indexOf('fileNewerWeekday'))
      .toBeLessThan(newestOrder.indexOf('fileOlderWeekday'));

    // --- Oldest ---
    await openSortModalAndApply(messages.sortByOldest.defaultMessage);
    const oldestOrder = getRenderedCardOrder();

    expect(oldestOrder.indexOf('fileOlderWeekday'))
      .toBeLessThan(oldestOrder.indexOf('fileNewerWeekday'));

    // --- Tiebreaker check: the tied pair's relative order should be an
    // exact reversal between Newest and Oldest, same as every other file,
    // not frozen in place (my first, incorrect tiebreaker attempt) and
    // not randomly different each toggle (the original bug). ---
    const tieOrderNewest = newestOrder.filter(id => id === 'fileTiedA' || id === 'fileTiedB');
    const tieOrderOldest = oldestOrder.filter(id => id === 'fileTiedA' || id === 'fileTiedB');
    expect(tieOrderNewest).toEqual([...tieOrderOldest].reverse());

    // --- Toggle back to Newest a second time: relative order of the tied
    // pair should be identical to the FIRST time we sorted Newest --
    // i.e. deterministic across repeated toggling, not scrambling again. ---
    await openSortModalAndApply(messages.sortByNewest.defaultMessage);
    const newestOrderAgain = getRenderedCardOrder();
    const tieOrderNewestAgain = newestOrderAgain
      .filter(id => id === 'fileTiedA' || id === 'fileTiedB');
    expect(tieOrderNewestAgain).toEqual(tieOrderNewest);
  });
});