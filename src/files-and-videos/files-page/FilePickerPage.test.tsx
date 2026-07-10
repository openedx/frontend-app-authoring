import { UserEvent } from '@testing-library/user-event';
import ReactDOM from 'react-dom';

import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import { executeThunk } from '@src/utils';
import { RequestStatus } from '@src/data/constants';
import { DeprecatedReduxState } from '@src/store';
import { FilePickerPage } from './FilePickerPage';
import {
  courseId,
  generateFetchAssetApiResponse,
  generateNextPageResponse,
  getStatusValue,
  initialState,
} from './factories/mockApiResponses';
import { fetchAssets } from './data/thunks';
import { getAssetsUrl } from './data/api';
import messages from "../generic/messages";

let axiosMock;
let store;

ReactDOM.createPortal = jest.fn((node: any) => node);

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn().mockReturnValue({
    isLoading: false,
    canViewFiles: true,
    canEditFiles: true,
    canDeleteFiles: true,
    canCreateFiles: true,
  }),
}));

const USAGE_KEY = 'block-v1:edX+DemoX+Demo_Course+type@video+block@v1';

const renderFilePickerPage = (queryParams: Record<string, string> = {}) => {
  const search = new URLSearchParams({
    usage_key: USAGE_KEY,
    ...queryParams,
  }).toString();
  render(<FilePickerPage />, {
    path: '/file_picker/:courseId',
    routerProps: { initialEntries: [`/file_picker/${courseId}?${search}`] },
  });
};

const setupFilePickerPage = async (
  queryParams: Record<string, string> = {},
  status = RequestStatus.SUCCESSFUL,
) => {
  const fetchAssetsUrl = `${getAssetsUrl(courseId)}?page=0`;
  axiosMock
    .onGet(fetchAssetsUrl)
    .reply(getStatusValue(status), generateFetchAssetApiResponse());
  const nextPageUrl = `${getAssetsUrl(courseId)}?page=1`;
  axiosMock
    .onGet(nextPageUrl)
    .reply(getStatusValue(status), generateNextPageResponse());
  renderFilePickerPage(queryParams);
  await executeThunk(fetchAssets(courseId), store.dispatch);
};

describe('FilePickerPage', () => {
  let parentPostMessageSpy: jest.SpyInstance;
  let closeSpy: jest.SpyInstance;
  let user: UserEvent;

  beforeEach(() => {
    const mocks = initializeMocks({
      initialState: {
        ...initialState,
        assets: { ...initialState.assets, assetIds: [] },
        models: {},
      } as unknown as Partial<DeprecatedReduxState>,
    });
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    // // The list-view test toggles the view, persisting it to localStorage; clear it so
    // // each test starts in the default card view.
    global.localStorage.clear();

    // filePickerSubmitFiles posts the selection to window.parent. In jsdom
    // window.parent === window, so spying on window.postMessage covers it.
    parentPostMessageSpy = jest
      .spyOn(window, 'postMessage')
      .mockImplementation(() => {});
    // GalleryCard closes the picker window after submitting a single selection.
    closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {});
    user = userEvent.setup();
  });

  afterEach(() => {
    parentPostMessageSpy.mockRestore();
    closeSpy.mockRestore();
  });

  const expectSelectionPosted = (fileId: string) => {
    expect(parentPostMessageSpy).toHaveBeenCalledWith(
      {
        type: 'org.openedx.assets.selected.v1',
        data: expect.arrayContaining([expect.objectContaining({ id: fileId })]),
      },
      '*',
    );
  };

  describe('non-embedded mode', () => {
    it('shows the single-select file picker heading and a Select button per gallery card', async () => {
      await setupFilePickerPage({ multiSelect: 'false', embedded: 'false' });

      expect(screen.getByText('Select a file')).toBeVisible();
      expect(
        screen.getByRole('button', { name: messages.useFilesButton.defaultMessage }),
      ).toBeDisabled();

      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: 'Select' })).toHaveLength(
          7,
        )
      );
      const selectButtons = screen.getAllByRole('button', { name: 'Select' });
      expect(selectButtons).toHaveLength(7);

      await user.click(selectButtons[0]);
      await waitFor(() => expectSelectionPosted('mOckID1'));
      expect(closeSpy).toHaveBeenCalled();
    });

    it('shows the multi-select file picker heading', async () => {
      await setupFilePickerPage({ multiSelect: 'true' });

      expect(screen.getByText('Select files')).toBeVisible();
    });
    describe('single-select', () => {
      it('shows a Select button per row in list view that posts the selection', async () => {
        await setupFilePickerPage({ multiSelect: 'false' });

        await user.click(screen.getByLabelText('List'));
        expect(screen.getByRole('table')).toBeVisible();

        const selectButtons = await screen.findAllByRole('button', {
          name: 'Select',
        });
        expect(selectButtons).toHaveLength(7);

        await user.click(selectButtons[0]);
        await waitFor(() => expectSelectionPosted('mOckID1'));
      });

      it('enables the Use file(s) button after a row is selected and posts the selection', async () => {
        await setupFilePickerPage({ multiSelect: 'false' });

        expect(
          screen.getByRole('button', { name: messages.useFilesButton.defaultMessage }),
        ).toBeDisabled();

        const checkboxes = await screen.findAllByTestId(
          'datatable-select-column-checkbox-cell',
        );
        await user.click(checkboxes[0]);

        await waitFor(() => {
          expect(
            screen.getAllByRole('button', { name: messages.useFilesButton.defaultMessage })[0],
          ).toBeEnabled();
        });

        parentPostMessageSpy.mockClear();
        await user.click(
          screen.getAllByRole('button', { name: messages.useFilesButton.defaultMessage })[0],
        );
        await waitFor(() => expectSelectionPosted('mOckID1'));
      });
    });
    describe('multi-select', () => {
      it('does not render per-row Select buttons in card view', async () => {
        await setupFilePickerPage({ multiSelect: 'true' });

        expect(screen.queryAllByRole('button', { name: 'Select' })).toHaveLength(
          0,
        );
      });

      it('posts the selection when a row is checked via the table selection', async () => {
        await setupFilePickerPage({ multiSelect: 'true' });

        const checkboxes = await screen.findAllByTestId(
          'datatable-select-column-checkbox-cell',
        );
        await user.click(checkboxes[0]);

        await waitFor(() => expectSelectionPosted('mOckID1'));
      });

      it('enables the Use File(s) button after selecting rows and posts the selection', async () => {
        await setupFilePickerPage({ multiSelect: 'true' });

        expect(
          screen.getByRole('button', { name: messages.useFilesButton.defaultMessage }),
        ).toBeDisabled();

        const checkboxes = await screen.findAllByTestId(
          'datatable-select-column-checkbox-cell',
        );
        await user.click(checkboxes[0]);

        await waitFor(() => {
          expect(
            screen.getAllByRole('button', { name: messages.useFilesButton.defaultMessage })[0],
          ).toBeEnabled();
        });

        parentPostMessageSpy.mockClear();
        await user.click(
          screen.getAllByRole('button', { name: messages.useFilesButton.defaultMessage })[0],
        );
        await waitFor(() => expectSelectionPosted('mOckID1'));
      });
    });
  });

  describe('embedded mode', () => {
    it('hides the heading in embedded mode', async () => {
      await setupFilePickerPage({ multiSelect: 'false', embedded: 'true' });

      expect(screen.queryByText('Select a file')).toBeNull();
      expect(screen.queryByText('Select files')).toBeNull();
    });

    it('does not show the Use File(s) button in embedded mode', async () => {
      await setupFilePickerPage({ multiSelect: 'true', embedded: 'true' });

      expect(screen.queryByRole('button', { name: messages.useFilesButton.defaultMessage })).toBeNull();
    });

    it('posts the selection when a row is checked', async () => {
      await setupFilePickerPage({ multiSelect: 'true', embedded: 'true' });

      const checkboxes = await screen.findAllByTestId(
        'datatable-select-column-checkbox-cell',
      );
      await user.click(checkboxes[0]);

      await waitFor(() => expectSelectionPosted('mOckID1'));
    });
  });

  describe('fileTypes filter', () => {
    it('only shows files whose wrapperType matches the requested fileTypes', async () => {
      await setupFilePickerPage({ multiSelect: 'true', fileTypes: 'image,document' });

      // mOckID1 is image/png -> 'image'; mOckID3 is application/pdf -> 'document'.
      // The other assets (code/audio/other) should be filtered out.
      await waitFor(
        () => {
          const cards = screen.getAllByTestId(/grid-card-/);
          expect(cards).toHaveLength(2);
          expect(
            cards.map((card) => card.getAttribute('data-testid')).sort(),
          ).toEqual(['grid-card-mOckID1', 'grid-card-mOckID3']);
        },
        { timeout: 5000 },
      );
    });
  });
});
