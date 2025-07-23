import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor, within, fireEvent,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { type CollectionHit } from '../../search-manager';
import CollectionCard from './CollectionCard';
import messages from './messages';
import { getLibraryCollectionApiUrl, getLibraryCollectionRestoreApiUrl } from '../data/api';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => mockNavigate,
}));

const collectionHitSample: CollectionHit = {
  id: 'lib-collectionorg1democourse-collection-display-name',
  type: 'collection',
  contextKey: 'lb:org1:Demo_Course',
  usageKey: 'lib-collection:org1:Demo_Course:collection-display-name',
  org: 'org1',
  blockId: 'collection-display-name',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Collection Display Name',
  description: 'Collection description',
  formatted: {
    displayName: 'Collection Display Formated Name',
    description: 'Collection description',
  },
  created: 1722434322294,
  modified: 1722434322294,
  numChildren: 2,
  published: {
    numChildren: 1,
  },
  tags: {},
};

let axiosMock: MockAdapter;
let mockShowToast;

const libraryId = 'lib:org1:Demo_Course';

const render = (ui: React.ReactElement, showOnlyPublished: boolean = false) => baseRender(ui, {
  path: '/library/:libraryId',
  params: { libraryId },
  extraWrapper: ({ children }) => (
    <LibraryProvider
      libraryId="lib:Axim:TEST"
      showOnlyPublished={showOnlyPublished}
    >
      {children}
    </LibraryProvider>
  ),
});

describe('<CollectionCard />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  it('should render the card with title and description', () => {
    render(<CollectionCard hit={collectionHitSample} />);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('Collection description')).toBeInTheDocument();
    expect(screen.queryByText('2')).toBeInTheDocument(); // Component count
  });

  it('should render published content', () => {
    render(<CollectionCard hit={collectionHitSample} />, true);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('Collection description')).toBeInTheDocument();
    expect(screen.queryByText('1')).toBeInTheDocument(); // Published Component Count
  });

  it('should navigate to the collection if the open menu clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionCard hit={collectionHitSample} />);

    // Open menu
    expect(screen.getByTestId('collection-card-menu-toggle')).toBeInTheDocument();
    await user.click(screen.getByTestId('collection-card-menu-toggle'));

    // Open menu item
    const openMenuItem = screen.getByRole('button', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();

    fireEvent.click(openMenuItem);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: `/library/${libraryId}/collection/${collectionHitSample.blockId}`,
        search: '',
      });
    });
  });

  it('should navigate to the collection if double clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionCard hit={collectionHitSample} />);

    // Card title
    const cardTitle = screen.getByText('Collection Display Formated Name');
    expect(cardTitle).toBeInTheDocument();
    await user.dblClick(cardTitle);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: `/library/${libraryId}/collection/${collectionHitSample.blockId}`,
        search: '',
      });
    });
  });

  it('should show confirmation box, delete collection and show toast to undo deletion', async () => {
    const user = userEvent.setup();
    const url = getLibraryCollectionApiUrl(collectionHitSample.contextKey, collectionHitSample.blockId);
    axiosMock.onDelete(url).reply(204);
    render(<CollectionCard hit={collectionHitSample} />);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    // Open menu
    let menuBtn = await screen.findByRole('button', { name: messages.collectionCardMenuAlt.defaultMessage });
    await user.click(menuBtn);
    // find and click delete menu option.
    expect(screen.queryByText('Delete')).toBeInTheDocument();
    let deleteBtn = await screen.findByRole('button', { name: 'Delete' });
    await user.click(deleteBtn);
    // verify confirmation dialog and click on cancel button
    let dialog = await screen.findByRole('dialog', { name: 'Delete this collection?' });
    expect(dialog).toBeInTheDocument();
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' });
    await user.click(cancelBtn);
    expect(axiosMock.history.delete.length).toEqual(0);
    expect(cancelBtn).not.toBeInTheDocument();

    // Open menu
    menuBtn = await screen.findByRole('button', { name: messages.collectionCardMenuAlt.defaultMessage });
    await user.click(menuBtn);
    // click on confirm button to delete
    deleteBtn = await screen.findByRole('button', { name: 'Delete' });
    await user.click(deleteBtn);
    dialog = await screen.findByRole('dialog', { name: 'Delete this collection?' });
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Delete' });
    await user.click(confirmBtn);
    expect(screen.queryByRole('dialog', { name: 'Delete this collection?' })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalled();
    });
    // Get restore / undo func from the toast
    const restoreFn = mockShowToast.mock.calls[0][1].onClick;

    const restoreUrl = getLibraryCollectionRestoreApiUrl(collectionHitSample.contextKey, collectionHitSample.blockId);
    axiosMock.onPost(restoreUrl).reply(200);
    // restore collection
    restoreFn();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
    });
  });

  it('should show failed toast on delete collection failure', async () => {
    const url = getLibraryCollectionApiUrl(collectionHitSample.contextKey, collectionHitSample.blockId);
    axiosMock.onDelete(url).reply(404);
    const user = userEvent.setup();
    render(<CollectionCard hit={collectionHitSample} />);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    // Open menu
    const menuBtn = await screen.findByRole('button', { name: messages.collectionCardMenuAlt.defaultMessage });
    await user.click(menuBtn);
    // find and click delete menu option.
    const deleteBtn = await screen.findByRole('button', { name: 'Delete' });
    await user.click(deleteBtn);
    const dialog = await screen.findByRole('dialog', { name: 'Delete this collection?' });
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Delete' });
    await user.click(confirmBtn);
    expect(screen.queryByRole('dialog', { name: 'Delete this collection?' })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalledWith('Failed to delete collection');
    });
  });
});
