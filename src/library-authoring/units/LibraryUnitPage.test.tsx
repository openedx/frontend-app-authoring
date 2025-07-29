import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';
import { act } from 'react';

import { ToastActionData } from '@src/generic/toast-context';
import { mockClipboardEmpty } from '@src/generic/data/api.mock';
import { mockContentSearchConfig, mockGetBlockTypes, mockSearchResult } from '@src/search-manager/data/api.mock';
import {
  initializeMocks,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';

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
import LibraryLayout from '../LibraryLayout';
import mockResult from '../__mocks__/unit-single.json';

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
const searchFilterfn = (requestData: any) => {
  const queryFilter = requestData?.queries[0]?.filter?.[1];
  const subsectionId = queryFilter?.split('usage_key IN ["')[1].split('"]')[0];
  switch (subsectionId) {
    case mockGetContainerMetadata.unitIdLoading:
      return new Promise<any>(() => {});
    case mockGetContainerMetadata.unitIdError:
      return Promise.reject(new Error('Not found'));
    default:
      return mockResult;
  }
};
mockSearchResult(mockResult, searchFilterfn);

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
    expect((await screen.findAllByText('Test Unit'))).toHaveLength(2); // Header + Sidebar
    expect(await screen.findByText('This unit is empty')).toBeInTheDocument();
  });

  it('can rename unit', async () => {
    renderLibraryUnitPage();
    expect((await screen.findAllByText('Test Unit'))).toHaveLength(2); // Header + Sidebar

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
    expect((await screen.findAllByText('Test Unit'))).toHaveLength(2); // Header + Sidebar

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
    expect(textBox).toHaveValue('Test Unit');
    screen.logTestingPlaygroundURL();
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
    const user = userEvent.setup();
    renderLibraryUnitPage();

    // sidebar should be visible by default
    const sidebar = await screen.findByTestId('library-sidebar');

    const { findByText } = within(sidebar);

    // The mock data for the sidebar has a title of "Test Unit"
    expect(await findByText('Test Unit')).toBeInTheDocument();

    // should close if open
    await user.click(await screen.findByText('Unit Info'));
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());

    // Open again
    await user.click(await screen.findByText('Unit Info'));
    expect(await screen.findByTestId('library-sidebar')).toBeInTheDocument();
  });

  it('should open and close component sidebar on component selection', async () => {
    const user = userEvent.setup();
    renderLibraryUnitPage();
    expect((await screen.findAllByText('Test Unit'))).toHaveLength(2); // Header + Sidebar
    // No Preview tab shown in sidebar
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();

    const component = await screen.findByText('text block 0');
    // Card is 3 levels up the component name div
    await user.click(component.parentElement!.parentElement!.parentElement!);
    const sidebar = await screen.findByTestId('library-sidebar');

    const { findByRole, findByText } = within(sidebar);

    // The mock data for the sidebar has a title of "text block 0"
    expect(await findByText('text block 0')).toBeInTheDocument();
    // Preview tab still not shown in sidebar
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();

    const closeButton = await findByRole('button', { name: /close/i });
    await user.click(closeButton);
    await waitFor(() => expect(screen.queryByTestId('library-sidebar')).not.toBeInTheDocument());
  });

  it('should rename component while clicking on name', async () => {
    const url = getXBlockFieldsApiUrl('lb:org1:Demo_course_generated:html:text-0');
    axiosMock.onPost(url).reply(200);
    renderLibraryUnitPage();
    expect((await screen.findAllByText('Test Unit'))).toHaveLength(2); // Header + Sidebar

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
    expect((await screen.findAllByText('Test Unit'))).toHaveLength(2); // Header + Sidebar

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
    const user = userEvent.setup();
    const url = getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.unitId);
    axiosMock.onDelete(url).reply(200);
    renderLibraryUnitPage();

    const component = await screen.findByText('text block 0');
    await user.click(component.parentElement!.parentElement!.parentElement!);
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
    const user = userEvent.setup();
    renderLibraryUnitPage();
    const component = await screen.findByText('text block 0');
    await user.dblClick(component.parentElement!.parentElement!.parentElement!);
    const dialog = screen.getByRole('dialog', { name: 'Editor Dialog' });
    expect(dialog).toBeInTheDocument();
  });

  it('"Add New Content" button should open "Add Content" sidebar', async () => {
    const user = userEvent.setup();
    renderLibraryUnitPage();
    const addContent = await screen.findByRole('button', { name: /add new content/i });
    await user.click(addContent);

    expect(await screen.findByRole('button', { name: /existing library content/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /text/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /problem/i })).toBeInTheDocument();
  });
});
