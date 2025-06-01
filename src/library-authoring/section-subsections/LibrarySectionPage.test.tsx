import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';

import { act } from 'react';
import {
  initializeMocks,
  fireEvent,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import {
  getLibraryContainerApiUrl,
  getLibraryContainerChildrenApiUrl,
} from '../data/api';
import {
  mockContentLibrary,
  mockXBlockFields,
  mockGetContainerMetadata,
  mockGetContainerChildren,
  mockLibraryBlockMetadata,
} from '../data/api.mocks';
import { mockContentSearchConfig, mockGetBlockTypes, mockSearchResult } from '../../search-manager/data/api.mock';
import { mockClipboardEmpty } from '../../generic/data/api.mock';
import LibraryLayout from '../LibraryLayout';
import { ToastActionData } from '../../generic/toast-context';
import mockResult from '../__mocks__/subsection-single.json';

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
mockSearchResult(mockResult);

const verticalSortableListCollisionDetection = jest.fn();
jest.mock('../../generic/DraggableList/verticalSortableList', () => ({
  ...jest.requireActual('../../generic/DraggableList/verticalSortableList'),
  // Since jsdom (used by jest) does not support getBoundingClientRect function
  // which is required for drag-n-drop calculations, we mock closestCorners fn
  // from dnd-kit to return collided elements as per the test. This allows us to
  // test all drag-n-drop handlers.
  verticalSortableListCollisionDetection: () => verticalSortableListCollisionDetection(),
}));

describe('<LibrarySectionPage />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  const renderLibrarySectionPage = (sectionId?: string, libraryId?: string) => {
    const libId = libraryId || mockContentLibrary.libraryId;
    const sId = sectionId || mockGetContainerMetadata.sectionId;
    render(<LibraryLayout />, {
      path,
      routerProps: {
        initialEntries: [`/library/${libId}/section/${sId}`],
      },
    });
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data about the collection (it loads forever):
    renderLibrarySectionPage(mockGetContainerMetadata.sectionIdLoading);
    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows an error component if no section returned', async () => {
    // This mock will simulate incorrect section id
    renderLibrarySectionPage(mockGetContainerMetadata.sectionIdError);
    const errorMessage = 'Not found';
    expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('shows section data', async () => {
    renderLibrarySectionPage();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
    // Unit title
    expect((await screen.findAllByText(mockGetContainerMetadata.sectionData.displayName))[0]).toBeInTheDocument();
    // unit info button
    expect(await screen.findByRole('button', { name: 'Section Info' })).toBeInTheDocument();
    expect((await screen.findAllByRole('button', { name: 'Drag to reorder' })).length).toEqual(3);
    // check all children components are rendered.
    expect(await screen.findByText('subsection block 0')).toBeInTheDocument();
    expect(await screen.findByText('subsection block 1')).toBeInTheDocument();
    expect(await screen.findByText('subsection block 2')).toBeInTheDocument();
  });

  it('can rename section', async () => {
    renderLibrarySectionPage();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    const editSectionTitleButton = screen.getAllByRole(
      'button',
      { name: /edit/i },
    )[0]; // 0 is the Section Title, 1 is the first component on the list
    fireEvent.click(editSectionTitleButton);

    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId);
    axiosMock.onPatch(url).reply(200);

    expect(await screen.findByRole('textbox', { name: /text input/i })).toBeInTheDocument();

    const textBox = await screen.findByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New Section Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
    });
    expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: 'New Section Title' }));

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Container updated successfully.');
  });

  it('show error if renaming section fails', async () => {
    renderLibrarySectionPage();
    expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();

    const editSectiontTitleButton = screen.getAllByRole(
      'button',
      { name: /edit/i },
    )[0]; // 0 is the Section Title, 1 is the first component on the list
    fireEvent.click(editSectiontTitleButton);

    const url = getLibraryContainerApiUrl(mockGetContainerMetadata.sectionId);
    axiosMock.onPatch(url).reply(400);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /text input/i })).toBeInTheDocument();
    });

    const textBox = screen.getByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New Section Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch[0].url).toEqual(url);
    });
    expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: 'New Section Title' }));

    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update container.');
  });

  it('should rename child by clicking edit icon besides name', async () => {
    const url = getLibraryContainerApiUrl('lb:org1:Demo_course:subsection:subsection-0');
    axiosMock.onPatch(url).reply(200);
    renderLibrarySectionPage();

    // Wait loading of the component
    await screen.findByText('subsection block 0');

    const editButton = (await screen.findAllByRole(
      'button',
      { name: /edit/i },
    ))[1]; // 0 is the Section Title, 1 is the first subsection on the list
    fireEvent.click(editButton);
    screen.debug(editButton);

    expect(await screen.findByRole('textbox', { name: /text input/i })).toBeInTheDocument();

    const textBox = await screen.findByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New subsection Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(1);
    });
    expect(axiosMock.history.patch[0].url).toEqual(url);
    expect(axiosMock.history.patch[0].data).toStrictEqual(JSON.stringify({
      display_name: 'New subsection Title',
    }));
    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Container updated successfully.');
  });

  it('should show error while updating child name', async () => {
    const url = getLibraryContainerApiUrl('lb:org1:Demo_course:subsection:subsection-0');
    axiosMock.onPatch(url).reply(400);
    renderLibrarySectionPage();

    // Wait loading of the component
    await screen.findByText('subsection block 0');

    const editButton = screen.getAllByRole(
      'button',
      { name: /edit/i },
    )[1]; // 0 is the Section Title, 1 is the first subsection on the list
    fireEvent.click(editButton);

    expect(await screen.findByRole('textbox', { name: /text input/i })).toBeInTheDocument();

    const textBox = await screen.findByRole('textbox', { name: /text input/i });
    expect(textBox).toBeInTheDocument();
    fireEvent.change(textBox, { target: { value: 'New subsection Title' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axiosMock.history.patch.length).toEqual(1);
    });
    expect(axiosMock.history.patch[0].url).toEqual(url);
    expect(axiosMock.history.patch[0].data).toStrictEqual(JSON.stringify({
      display_name: 'New subsection Title',
    }));
    expect(textBox).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update container.');
  });

  it('should call update order api on dragging children', async () => {
    renderLibrarySectionPage();
    const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
    axiosMock
      .onPatch(getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.sectionId))
      .reply(200);
    verticalSortableListCollisionDetection.mockReturnValue([{ id: 'lb:org1:Demo_course:subsection:subsection-1----1' }]);
    await act(async () => {
      fireEvent.keyDown(firstDragHandle, { code: 'Space' });
    });
    setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Space' }));
    await waitFor(() => expect(mockShowToast).toHaveBeenLastCalledWith('Order updated'));
  });

  it('should cancel update order api on cancelling dragging component', async () => {
    renderLibrarySectionPage();
    const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
    axiosMock
      .onPatch(getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.sectionId))
      .reply(200);
    verticalSortableListCollisionDetection.mockReturnValue([{ id: 'lb:org1:Demo_course:subsection:subsection-1----1' }]);
    await act(async () => {
      fireEvent.keyDown(firstDragHandle, { code: 'Space' });
    });
    setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Escape' }));
    await waitFor(() => expect(mockShowToast).not.toHaveBeenLastCalledWith('Order updated'));
  });

  it('should show toast error message on update order failure', async () => {
    renderLibrarySectionPage();
    const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
    axiosMock
      .onPatch(getLibraryContainerChildrenApiUrl(mockGetContainerMetadata.sectionId))
      .reply(500);
    verticalSortableListCollisionDetection.mockReturnValue([{ id: 'lb:org1:Demo_course:subsection:subsection-1----1' }]);
    await act(async () => {
      fireEvent.keyDown(firstDragHandle, { code: 'Space' });
    });
    setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Space' }));
    await waitFor(() => expect(mockShowToast).toHaveBeenLastCalledWith('Failed to update children order'));
  });

  it('should open subsection page on double click', async () => {
    renderLibrarySectionPage();
    const subsection = await screen.findByText('subsection block 0');
    // trigger double click
    userEvent.click(subsection.parentElement!, undefined, { clickCount: 2 });
    expect((await screen.findAllByText(mockGetContainerMetadata.subsectionData.displayName))[0]).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Subsection Info' })).toBeInTheDocument();
  });
});
