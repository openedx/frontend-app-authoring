import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
} from '../../testUtils';
import { mockContentLibrary, mockGetContainerChildren, mockGetContainerMetadata } from '../data/api.mocks';
import { LibraryProvider } from '../common/context/LibraryContext';
import UnitInfo from './UnitInfo';
import { getLibraryContainerApiUrl, getLibraryContainerPublishApiUrl } from '../data/api';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';

mockGetContainerMetadata.applyMock();
mockContentLibrary.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();

const { libraryId } = mockContentLibrary;
const { containerId } = mockGetContainerMetadata;

const render = (showOnlyPublished: boolean = false) => {
  const params: { libraryId: string, unitId?: string } = { libraryId, unitId: containerId };
  return baseRender(<UnitInfo />, {
    path: '/library/:libraryId/:unitId?',
    params,
    extraWrapper: ({ children }) => (
      <LibraryProvider
        libraryId={libraryId}
        showOnlyPublished={showOnlyPublished}
      >
        <SidebarProvider
          initialSidebarComponentInfo={{
            id: containerId,
            type: SidebarBodyComponentId.UnitInfo,
          }}
        >
          {children}
        </SidebarProvider>
      </LibraryProvider>
    ),
  });
};
let axiosMock: MockAdapter;
let mockShowToast;

describe('<UnitInfo />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  it('should delete the unit using the menu', async () => {
    axiosMock.onDelete(getLibraryContainerApiUrl(containerId)).reply(200);
    render();

    // Open menu
    expect(await screen.findByTestId('unit-info-menu-toggle')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('unit-info-menu-toggle'));

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
  });

  it('can publish the container', async () => {
    axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(200);
    render();

    // Click on Publish button
    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    expect(publishButton).toBeInTheDocument();
    userEvent.click(publishButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('All changes published');
  });

  it('shows an error if publishing the container fails', async () => {
    axiosMock.onPost(getLibraryContainerPublishApiUrl(containerId)).reply(500);
    render();

    // Click on Publish button
    const publishButton = await screen.findByRole('button', { name: 'Publish' });
    expect(publishButton).toBeInTheDocument();
    userEvent.click(publishButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Failed to publish changes');
  });

  it('show only published content', async () => {
    render(true);
    expect(await screen.findByTestId('unit-info-menu-toggle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /text block published 1/i })).toBeInTheDocument();
  });
});
