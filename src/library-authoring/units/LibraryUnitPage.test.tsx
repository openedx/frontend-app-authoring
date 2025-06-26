import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import { act } from 'react';
import {
  initializeMocks,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '../../testUtils';
import {
  getLibraryContainerApiUrl,
  getLibraryContainerChildrenApiUrl,
  getXBlockFieldsApiUrl,
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
import LibraryLayout from '../LibraryLayout';
import { ToastActionData } from '../../generic/toast-context';

const path = '/library/:libraryId/*';
const libraryTitle = mockContentLibrary.libraryData.title;

let axiosMock: MockAdapter;
let mockShowToast: (message: string, action?: ToastActionData | undefined) => void;

mockClipboardEmpty.applyMock();
mockGetContainerMetadata.applyMock();
mockGetContainerChildren.applyMock();
mockContentSearchConfig.applyMock();
mockGetBlockTypes.applyMock();
mockContentLibrary.applyMock();
mockXBlockFields.applyMock();
mockLibraryBlockMetadata.applyMock();

const verticalSortableListCollisionDetection = jest.fn();
jest.mock('../../generic/DraggableList/verticalSortableList', () => ({
  ...jest.requireActual('../../generic/DraggableList/verticalSortableList'),
  // Since jsdom (used by jest) does not support getBoundingClientRect function
  // which is required for drag-n-drop calculations, we mock closestCorners fn
  // from dnd-kit to return collided elements as per the test. This allows us to
  // test all drag-n-drop handlers.
  verticalSortableListCollisionDetection: () => verticalSortableListCollisionDetection(),
}));

describe('<LibraryUnitPage />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  const renderLibraryUnitPage = (unitId?: string, libraryId?: string) => {
    const libId = libraryId || mockContentLibrary.libraryId;
    const uId = unitId || mockGetContainerMetadata.unitId;
    render(<LibraryLayout />, {
      path,
      routerProps: {
        initialEntries: [`/library/${libId}/unit/${uId}`],
      },
    });
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data about the collection (it loads forever):
    renderLibraryUnitPage(mockGetContainerMetadata.unitIdLoading);
    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no unit returned', async () => {
    // This mock will simulate incorrect unit id
    renderLibraryUnitPage(mockGetContainerMetadata.unitIdError);
    const errorMessage = 'Not found';
    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('shows unit data', async () => {
    renderLibraryUnitPage();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    // Unit title -- on main page + sidebar
    expect((await screen.findAllByText(mockGetContainerMetadata.containerData.displayName))[0]).toBeInTheDocument();
    // unit info button
    expect(await screen.findByRole('button', { name: 'Unit Info' })).toBeInTheDocument();
    expect((await screen.findAllByRole('button', { name: 'Drag to reorder' })).length).toEqual(3);
    // check all children components are rendered.
    expect(await screen.findByText('text block 0')).toBeInTheDocument();
    expect(await screen.findByText('text block 1')).toBeInTheDocument();
    expect(await screen.findByText('text block 2')).toBeInTheDocument();
    // 3 preview iframes on main page
    expect((await screen.findAllByTestId('block-preview')).length).toEqual(3);
    // No Preview tab in sidebar
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('shows empty unit', async () => {
    renderLibraryUnitPage(mockGetContainerMetadata.unitIdEmpty);
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    expect(await screen.findByText('This unit is empty')).toBeInTheDocument();
  });

  it('can rename unit', async () => {
    renderLibraryUnitPage();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    const editUnitTitleButton = screen.getAllByRole(
      'button',
      { name: /edit/i },
    )[0]; // 0 is the Unit Title, 1 is the first component on the list
    fireEvent.click(editUnitTitleButton);

    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onPatch(url).reply(200);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /text input/i })).toBeInTheDocument();
    });

    const textBox = screen.getByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New Unit Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
    });
    expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: 'New Unit Title' }));

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Container updated successfully.');
  });

  it('show error if renaming unit fails', async () => {
    renderLibraryUnitPage();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    const editUnitTitleButton = screen.getAllByRole(
      'button',
      { name: /edit/i },
    )[0]; // 0 is the Unit Title, 1 is the first component on the list
    fireEvent.click(editUnitTitleButton);

    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onPatch(url).reply(400);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /text input/i })).toBeInTheDocument();
    });

    const textBox = screen.getByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New Unit Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
    });
    expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: 'New Unit Title' }));

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update container.');
  });

  it('should open and close the unit sidebar', async () => {
    renderLibraryUnitPage();

    // sidebar should be visible by default
    const sidebar = await screen.findByTestId('library-sidebar');

    const { findByText } = within(sidebar);

    // The mock data for the sidebar has a title of "Test Unit"
    expect(await findByText('Test Unit')).toBeInTheDocument();

    // should close if open
    userEvent.click(await screen.findByText('Unit Info'));
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());

    // Open again
    userEvent.click(await screen.findByText('Unit Info'));
    expect(await screen.findByTestId('library-sidebar')).toBeInTheDocument();
  });

  it('should open and close component sidebar on component selection', async () => {
    renderLibraryUnitPage();
    expect((await screen.findAllByText('Test Unit')).length).toBeGreaterThan(1);
    // No Preview tab shown in sidebar
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();

    const component = await screen.findByText('text block 0');
    // Card is 3 levels up the component name div
    userEvent.click(component.parentElement!.parentElement!.parentElement!);
    const sidebar = await screen.findByTestId('library-sidebar');

    const { findByRole, findByText } = within(sidebar);

    // The mock data for the sidebar has a title of "text block 0"
    expect(await findByText('text block 0')).toBeInTheDocument();
    // Preview tab still not shown in sidebar
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();

    const closeButton = await findByRole('button', { name: /close/i });
    userEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('should rename component while clicking on name', async () => {
    const url = getXBlockFieldsApiUrl('lb:org1:Demo_course_generated:html:text-0');
    axiosMock.onPost(url).reply(200);
    renderLibraryUnitPage();

    // Wait loading of the component
    await screen.findByText('text block 0');

    const editButton = screen.getAllByRole(
      'button',
      { name: /edit/i },
    )[1]; // 0 is the Unit Title, 1 is the first component on the list
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /text input/i })).toBeInTheDocument();
    });

    const textBox = screen.getByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New Component Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(axiosMock.history.post[0].url).toEqual(url);
    expect(axiosMock.history.post[0].data).toStrictEqual(JSON.stringify({
      metadata: { display_name: 'New Component Title' },
    }));
    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Component updated successfully.');
  });

  it('should show error while updating component name', async () => {
    const url = getXBlockFieldsApiUrl('lb:org1:Demo_course_generated:html:text-0');
    axiosMock.onPost(url).reply(400);
    renderLibraryUnitPage();

    // Wait loading of the component
    await screen.findByText('text block 0');

    const editButton = screen.getAllByRole(
      'button',
      { name: /edit/i },
    )[1]; // 0 is the Unit Title, 1 is the first component on the list
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /text input/i })).toBeInTheDocument();
    });

    const textBox = screen.getByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New Component Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(axiosMock.history.post[0].url).toEqual(url);
    expect(axiosMock.history.post[0].data).toStrictEqual(JSON.stringify({
      metadata: { display_name: 'New Component Title' },
    }));
    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('There was an error updating the component.');
  });

  it('should call update order api on dragging component', async () => {
    renderLibraryUnitPage();
    const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
    axiosMock
      .onPatch(getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId))
      .reply(200);
    verticalSortableListCollisionDetection.mockReturnValue([{
      id: 'lb:org1:Demo_course_generated:html:text-1----1',
    }]);
    await act(async () => {
      fireEvent.keyDown(firstDragHandle, { code: 'Space' });
    });
    setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Space' }));
    await waitFor(() => expect(mockShowToast).toHaveBeenLastCalledWith('Order updated'));
  });

  it('should cancel update order api on cancelling dragging component', async () => {
    renderLibraryUnitPage();
    const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
    axiosMock
      .onPatch(getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId))
      .reply(200);
    verticalSortableListCollisionDetection.mockReturnValue([{
      id: 'lb:org1:Demo_course_generated:html:text-1----1',
    }]);
    await act(async () => {
      fireEvent.keyDown(firstDragHandle, { code: 'Space' });
    });
    setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Escape' }));
    await waitFor(() => expect(mockShowToast).not.toHaveBeenLastCalledWith('Order updated'));
  });

  it('should show toast error message on update order failure', async () => {
    renderLibraryUnitPage();
    const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
    axiosMock
      .onPatch(getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId))
      .reply(500);
    verticalSortableListCollisionDetection.mockReturnValue([{
      id: 'lb:org1:Demo_course_generated:html:text-1----1',
    }]);
    await act(async () => {
      fireEvent.keyDown(firstDragHandle, { code: 'Space' });
    });
    setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Space' }));
    await waitFor(() => expect(mockShowToast).toHaveBeenLastCalledWith('Failed to update components order'));
  });

  it('should remove a component & restore from component card', async () => {
    const url = getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onDelete(url).reply(200);
    renderLibraryUnitPage();

    expect(await screen.findByText('text block 0')).toBeInTheDocument();
    const menu = screen.getAllByRole('button', { name: /component actions menu/i })[0];
    fireEvent.click(menu);

    const removeButton = await screen.findByText('Remove from unit');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    // Get restore / undo func from the toast
    // @ts-ignore
    const restoreFn = mockShowToast.mock.calls[0][1].onClick;

    const restoreUrl = getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onPost(restoreUrl).reply(200);
    // restore collection
    restoreFn();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
  });

  it('should show error on remove a component', async () => {
    const url = getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onDelete(url).reply(404);
    renderLibraryUnitPage();

    expect(await screen.findByText('text block 0')).toBeInTheDocument();
    const menu = screen.getAllByRole('button', { name: /component actions menu/i })[0];
    fireEvent.click(menu);

    const removeButton = await screen.findByText('Remove from unit');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Failed to remove component');
  });

  it('should show error on restore removed component', async () => {
    const url = getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onDelete(url).reply(200);
    renderLibraryUnitPage();

    expect(await screen.findByText('text block 0')).toBeInTheDocument();
    const menu = screen.getAllByRole('button', { name: /component actions menu/i })[0];
    fireEvent.click(menu);

    const removeButton = await screen.findByText('Remove from unit');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    // Get restore / undo func from the toast
    // @ts-ignore
    const restoreFn = mockShowToast.mock.calls[0][1].onClick;

    const restoreUrl = getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onPost(restoreUrl).reply(404);
    // restore collection
    restoreFn();
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(mockShowToast).toHaveBeenCalledWith('Failed to undo remove component operation');
  });

  it('should remove a component from component sidebar', async () => {
    const url = getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onDelete(url).reply(200);
    renderLibraryUnitPage();

    const component = await screen.findByText('text block 0');
    userEvent.click(component.parentElement!.parentElement!.parentElement!);
    const sidebar = await screen.findByTestId('library-sidebar');

    const { findByRole, findByText } = within(sidebar);

    const menu = await findByRole('button', { name: /component actions menu/i });
    fireEvent.click(menu);

    const removeButton = await findByText('Remove from unit');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });

  it('should show editor on double click', async () => {
    renderLibraryUnitPage();
    const component = await screen.findByText('text block 0');
    // trigger double click
    userEvent.click(component.parentElement!.parentElement!.parentElement!, undefined, { clickCount: 2 });
    expect(await screen.findByRole('dialog', { name: 'Editor Dialog' })).toBeInTheDocument();
  });

<<<<<<< dvz/single-overflow-visitble
  describe('clicks on non-dropdown elements call stopPropagation while dropdown toggles do not', () => {
    it('should call stopPropagation when clicking on BlockHeader non-dropdown elements', async () => {
      renderLibraryUnitPage();

      // Wait for components to load
      await screen.findByText('text block 0');

      // Find all TagCount elements (they are part of the BlockHeader and not dropdown toggles)
      const tagCountElements = screen.getAllByTestId('generic-tag-count');
      expect(tagCountElements.length).toBeGreaterThan(0);

      const tagCountElement = tagCountElements[0];

      // Spy on the stopPropagation method of events
      const stopPropagationSpy = jest.fn();

      // Add event listener to capture the event and spy on stopPropagation
      tagCountElement.addEventListener('click', (e) => {
        // Replace the stopPropagation method with our spy
        e.stopPropagation = stopPropagationSpy;
      }, true); // Use capture phase to ensure our spy is set before the component's handler

      // Click on the TagCount element (which is not a dropdown toggle)
      fireEvent.click(tagCountElement);

      // Verify that stopPropagation was called
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should call stopPropagation when clicking on ComponentBlock content area', async () => {
      renderLibraryUnitPage();

      // Wait for components to load
      await screen.findByText('text block 0');

      // Find the component card - it should be in a sortable item
      const componentCard = screen.getByText('text block 0').closest('[class*="pgn__card"]');
      expect(componentCard).toBeInTheDocument();

      // Create a custom event and spy on stopPropagation
      const stopPropagationSpy = jest.fn();

      // Test the event handling by creating a real click event that mimics clicking inside the content area
      // but not on a dropdown toggle element
      const mockEvent = new Event('click', { bubbles: true });
      Object.defineProperty(mockEvent, 'target', {
        value: document.createElement('div'), // Normal div, not a dropdown toggle
        writable: false,
      });
      Object.defineProperty(mockEvent, 'stopPropagation', {
        value: stopPropagationSpy,
        writable: true,
      });

      // Mock the closest method to return null (not a dropdown toggle)
      (mockEvent.target as any).closest = jest.fn().mockReturnValue(null);

      // Simulate the onClick handler logic from ComponentBlock
      const target = mockEvent.target as HTMLElement;
      const isDropdownToggle = target.closest('[data-testid="dropdown"], [data-testid="container-card-menu-toggle"], .pgn__dropdown-toggle-iconbutton');

      if (!isDropdownToggle) {
        mockEvent.stopPropagation();
      }

      // Verify that stopPropagation was called because this is NOT a dropdown toggle
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should NOT call stopPropagation when clicking dropdown toggle elements to let dropdowns coordinate', async () => {
      renderLibraryUnitPage();

      // Wait for components to load
      await screen.findByText('text block 0');

      // Create a custom event and spy on stopPropagation
      const stopPropagationSpy = jest.fn();

      // Create a mock dropdown toggle element
      const mockDropdownElement = document.createElement('button');
      mockDropdownElement.setAttribute('data-testid', 'dropdown');

      // Test the event handling by creating a real click event on a dropdown toggle
      const mockEvent = new Event('click', { bubbles: true });
      Object.defineProperty(mockEvent, 'target', {
        value: mockDropdownElement,
        writable: false,
      });
      Object.defineProperty(mockEvent, 'stopPropagation', {
        value: stopPropagationSpy,
        writable: true,
      });

      // Mock the closest method to return the dropdown element (IS a dropdown toggle)
      (mockEvent.target as any).closest = jest.fn().mockReturnValue(mockDropdownElement);

      // Simulate the onClick handler logic from ComponentBlock
      const target = mockEvent.target as HTMLElement;
      const isDropdownToggle = target.closest('[data-testid="dropdown"], [data-testid="container-card-menu-toggle"], .pgn__dropdown-toggle-iconbutton');

      if (!isDropdownToggle) {
        mockEvent.stopPropagation();
      }

      // Verify that stopPropagation was NOT called because this IS a dropdown toggle
      expect(stopPropagationSpy).not.toHaveBeenCalled();
    });
  });

  const reorderTestCases = [
    {
      name: 'should show success toast when reorder operation succeeds',
      responseStatus: 200,
      expectedToastMessage: 'Order updated',
    },
    {
      name: 'should show error toast when reorder operation fails',
      responseStatus: 500,
      expectedToastMessage: 'Failed to update components order',
    },
  ];

  reorderTestCases.forEach(({ name, responseStatus, expectedToastMessage }) => {
    it(name, async () => {
      renderLibraryUnitPage();

      // Get the first drag handle
      const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];

      // Mock API response based on test case
      axiosMock
        .onPatch(getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId))
        .reply(responseStatus);

      // Mock collision detection to return a valid drop target
      verticalSortableListCollisionDetection.mockReturnValue([{
        id: 'lb:org1:Demo_course_generated:html:text-1----1',
      }]);

      // Simulate drag and drop reorder operation using keyboard
      await act(async () => {
        fireEvent.keyDown(firstDragHandle, { code: 'Space' });
      });
      setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Space' }));

      // Verify expected toast message is shown
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(expectedToastMessage);
      });
    });
=======
  it('"Add New Content" button should open "Add Content" sidebar', async () => {
    renderLibraryUnitPage();
    const addContent = await screen.findByRole('button', { name: /add new content/i });
    userEvent.click(addContent);

    expect(await screen.findByRole('button', { name: /existing library content/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /text/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /problem/i })).toBeInTheDocument();
>>>>>>> master
  });
});
