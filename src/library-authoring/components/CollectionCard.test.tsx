import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor, waitForElementToBeRemoved, within,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { type CollectionHit } from '../../search-manager';
import CollectionCard from './CollectionCard';
import messages from './messages';
import { getLibraryCollectionApiUrl, getLibraryCollectionRestoreApiUrl } from '../data/api';

const CollectionHitSample: CollectionHit = {
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

const render = (ui: React.ReactElement, showOnlyPublished: boolean = false) => baseRender(ui, {
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
    render(<CollectionCard collectionHit={CollectionHitSample} />);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('Collection description')).toBeInTheDocument();
    expect(screen.queryByText('Collection (2)')).toBeInTheDocument();
  });

  it('should render published content', () => {
    render(<CollectionCard collectionHit={CollectionHitSample} />, true);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('Collection description')).toBeInTheDocument();
    expect(screen.queryByText('Collection (1)')).toBeInTheDocument();
  });

  it('should navigate to the collection if the open menu clicked', async () => {
    render(<CollectionCard collectionHit={CollectionHitSample} />);

    // Open menu
    expect(screen.getByTestId('collection-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('collection-card-menu-toggle'));

    // Open menu item
    const openMenuItem = screen.getByRole('link', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();

    expect(openMenuItem).toHaveAttribute('href', '/library/lb:org1:Demo_Course/collection/collection-display-name');
  });

  it('should show confirmation box, delete collection and show toast to undo deletion', async () => {
    const url = getLibraryCollectionApiUrl(CollectionHitSample.contextKey, CollectionHitSample.blockId);
    axiosMock.onDelete(url).reply(204);
    render(<CollectionCard collectionHit={CollectionHitSample} />);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    // Open menu
    let menuBtn = await screen.findByRole('button', { name: messages.collectionCardMenuAlt.defaultMessage });
    userEvent.click(menuBtn);
    // find and click delete menu option.
    expect(screen.queryByText('Delete')).toBeInTheDocument();
    let deleteBtn = await screen.findByRole('button', { name: 'Delete' });
    userEvent.click(deleteBtn);
    // verify confirmation dialog and click on cancel button
    let dialog = await screen.findByRole('dialog', { name: 'Delete this collection?' });
    expect(dialog).toBeInTheDocument();
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' });
    userEvent.click(cancelBtn);
    expect(axiosMock.history.delete.length).toEqual(0);
    expect(cancelBtn).not.toBeInTheDocument();

    // Open menu
    menuBtn = await screen.findByRole('button', { name: messages.collectionCardMenuAlt.defaultMessage });
    userEvent.click(menuBtn);
    // click on confirm button to delete
    deleteBtn = await screen.findByRole('button', { name: 'Delete' });
    userEvent.click(deleteBtn);
    dialog = await screen.findByRole('dialog', { name: 'Delete this collection?' });
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Delete' });
    userEvent.click(confirmBtn);
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Delete this collection?' }));

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalled();
    });
    // Get restore / undo func from the toast
    const restoreFn = mockShowToast.mock.calls[0][1].onClick;

    const restoreUrl = getLibraryCollectionRestoreApiUrl(CollectionHitSample.contextKey, CollectionHitSample.blockId);
    axiosMock.onPost(restoreUrl).reply(200);
    // restore collection
    restoreFn();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
    });
  });

  it('should show failed toast on delete collection failure', async () => {
    const url = getLibraryCollectionApiUrl(CollectionHitSample.contextKey, CollectionHitSample.blockId);
    axiosMock.onDelete(url).reply(404);
    render(<CollectionCard collectionHit={CollectionHitSample} />);

    expect(screen.queryByText('Collection Display Formated Name')).toBeInTheDocument();
    // Open menu
    const menuBtn = await screen.findByRole('button', { name: messages.collectionCardMenuAlt.defaultMessage });
    userEvent.click(menuBtn);
    // find and click delete menu option.
    const deleteBtn = await screen.findByRole('button', { name: 'Delete' });
    userEvent.click(deleteBtn);
    const dialog = await screen.findByRole('dialog', { name: 'Delete this collection?' });
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Delete' });
    userEvent.click(confirmBtn);
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Delete this collection?' }));

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
      expect(mockShowToast).toHaveBeenCalledWith('Failed to delete collection');
    });
  });
});
