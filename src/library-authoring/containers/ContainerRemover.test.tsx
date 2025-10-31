import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import {
  getLibraryContainerChildrenApiUrl,
} from '../data/api';
import {
  mockContentLibrary,
  mockXBlockFields,
  mockGetContainerMetadata,
  mockGetContainerChildren,
  mockLibraryBlockMetadata,
} from '../data/api.mocks';
import { mockContentSearchConfig, mockGetBlockTypes } from '../../search-manager/data/api.mock';
import { mockClipboardEmpty } from '../../generic/data/api.mock';
import { ToastProvider } from '../../generic/toast-context';
import ContainerRemover from './ContainerRemover';
import { LibraryProvider } from '../common/context/LibraryContext';

let axiosMock: MockAdapter;

mockClipboardEmpty.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();
mockContentSearchConfig.applyMock();
mockGetBlockTypes.applyMock();
mockContentLibrary.applyMock();
mockXBlockFields.applyMock();
mockLibraryBlockMetadata.applyMock();

const mockClose = jest.fn();

const { libraryId } = mockContentLibrary;
const renderModal = (element: React.ReactNode) => {
  render(
    <ToastProvider>
      <LibraryProvider libraryId={libraryId}>
        {element}
      </LibraryProvider>
    </ToastProvider>,
  );
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockImplementation(() => ({
    containerId: mockGetContainerChildren.unitIdWithDuplicate,
  })),
}));

describe('<ContainerRemover />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('triggers update container children api call when duplicates are present', async () => {
    const user = userEvent.setup();
    const url = getLibraryContainerChildrenApiUrl(mockGetContainerChildren.unitIdWithDuplicate);
    axiosMock.onPatch(url).reply(200);
    const result = await mockGetContainerChildren(mockGetContainerChildren.unitIdWithDuplicate);
    const resultIds = result.map((obj) => obj.id);
    renderModal(<ContainerRemover
      close={mockClose}
      containerKey={result[0].id}
      displayName="Title"
      index={0}
    />);
    const btn = await screen.findByRole('button', { name: 'Remove' });
    await user.click(btn);

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
      // Only the first element is removed even though the last element has the same id.
      expect(JSON.parse(axiosMock.history.patch[0].data).usage_keys).toEqual(resultIds.slice(1));
    });
    expect(mockClose).toHaveBeenCalled();
  });
});
