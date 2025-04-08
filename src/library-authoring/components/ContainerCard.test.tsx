import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { type ContainerHit, PublishStatus } from '../../search-manager';
import ContainerCard from './ContainerCard';
import { getLibraryContainerApiUrl, getLibraryContainerRestoreApiUrl } from '../data/api';

const containerHitSample: ContainerHit = {
  id: 'lctorg1democourse-unit-display-name-123',
  type: 'library_container',
  contextKey: 'lb:org1:Demo_Course',
  usageKey: 'lct:org1:Demo_Course:unit:unit-display-name-123',
  org: 'org1',
  blockId: 'unit-display-name-123',
  blockType: 'unit',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Unit Display Name',
  formatted: {
    displayName: 'Unit Display Formated Name',
    published: {
      displayName: 'Published Unit Display Name',
    },
  },
  created: 1722434322294,
  modified: 1722434322294,
  numChildren: 2,
  published: {
    numChildren: 1,
  },
  tags: {},
  publishStatus: PublishStatus.Published,
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

describe('<ContainerCard />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  it('should render the card with title', () => {
    render(<ContainerCard hit={containerHitSample} />);

    expect(screen.queryByText('Unit Display Formated Name')).toBeInTheDocument();
    expect(screen.queryByText('2')).toBeInTheDocument(); // Component count
  });

  it('should render published content', () => {
    render(<ContainerCard hit={containerHitSample} />, true);

    expect(screen.queryByText('Published Unit Display Name')).toBeInTheDocument();
    expect(screen.queryByText('1')).toBeInTheDocument(); // Published Component Count
  });

  it('should navigate to the container if the open menu clicked', async () => {
    render(<ContainerCard hit={containerHitSample} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

    // Open menu item
    const openMenuItem = screen.getByRole('link', { name: 'Open' });
    expect(openMenuItem).toBeInTheDocument();

    // TODO: To be implemented
    // expect(openMenuItem).toHaveAttribute(
    //   'href',
    //   '/library/lb:org1:Demo_Course/container/container-display-name-123',
    // );
  });

  it('should delete the container from the menu & restore the container', async () => {
    axiosMock.onDelete(getLibraryContainerApiUrl(containerHitSample.usageKey)).reply(200);

    render(<ContainerCard hit={containerHitSample} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

    // Click on Delete Item
    const deleteMenuItem = screen.getByRole('button', { name: 'Delete' });
    expect(deleteMenuItem).toBeInTheDocument();
    fireEvent.click(deleteMenuItem);

    // Confirm delete Modal is open
    expect(screen.getByText('Delete Unit'));
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(mockShowToast).toHaveBeenCalled();

    // Get restore / undo func from the toast
    const restoreFn = mockShowToast.mock.calls[0][1].onClick;

    const restoreUrl = getLibraryContainerRestoreApiUrl(containerHitSample.usageKey);
    axiosMock.onPost(restoreUrl).reply(200);
    // restore collection
    restoreFn();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
  });

  it('should show error on delete the container from the menu', async () => {
    axiosMock.onDelete(getLibraryContainerApiUrl(containerHitSample.usageKey)).reply(400);

    render(<ContainerCard hit={containerHitSample} />);

    // Open menu
    expect(screen.getByTestId('container-card-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('container-card-menu-toggle'));

    // Click on Delete Item
    const deleteMenuItem = screen.getByRole('button', { name: 'Delete' });
    expect(deleteMenuItem).toBeInTheDocument();
    fireEvent.click(deleteMenuItem);

    // Confirm delete Modal is open
    expect(screen.getByText('Delete Unit'));
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Failed to delete unit');
  });
});
