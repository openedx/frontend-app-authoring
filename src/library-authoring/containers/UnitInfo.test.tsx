import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import {
  initializeMocks, render as baseRender, screen, waitFor,
  fireEvent,
} from '../../testUtils';
import { mockContentLibrary, mockGetContainerMetadata } from '../data/api.mocks';
import { LibraryProvider } from '../common/context/LibraryContext';
import UnitInfo from './UnitInfo';
import { getLibraryContainerApiUrl } from '../data/api';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';

mockGetContainerMetadata.applyMock();
const { libraryId } = mockContentLibrary;
const { containerId } = mockGetContainerMetadata;
const render = () => baseRender(<UnitInfo />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider
      libraryId={libraryId}
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
let axiosMock: MockAdapter;
let mockShowToast;

describe('<UnitInfo />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  it('should detele the unit using the menu', async () => {
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
});
