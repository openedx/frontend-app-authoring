import userEvent from '@testing-library/user-event';
import type MockAdapter from 'axios-mock-adapter';
import { QueryClient } from '@tanstack/react-query';

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
  getLibraryContainersApiUrl,
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
import { ContainerType } from '../../generic/key-utils';

const path = '/library/:libraryId/*';
const libraryTitle = mockContentLibrary.libraryData.title;

let axiosMock: MockAdapter;
let queryClient: QueryClient;
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
    case mockGetContainerMetadata.subsectionIdLoading:
      return new Promise<any>(() => {});
    case mockGetContainerMetadata.subsectionIdError:
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

describe('<LibrarySectionPage / LibrarySubsectionPage />', () => {
  beforeEach(() => {
    ({ axiosMock, mockShowToast, queryClient } = initializeMocks());
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  const renderLibrarySectionPage = (
    containerId?: string,
    libraryId?: string,
    cType: ContainerType = ContainerType.Section,
    childId?: string,
  ) => {
    const libId = libraryId || mockContentLibrary.libraryId;
    const defaultId = cType === ContainerType.Section
      ? mockGetContainerMetadata.sectionId
      : mockGetContainerMetadata.subsectionId;
    const cId = containerId || defaultId;
    render(<LibraryLayout />, {
      path,
      routerProps: {
        initialEntries: [childId
          ? `/library/${libId}/${cType}/${cId}/${childId}`
          : `/library/${libId}/${cType}/${cId}`,
        ],
      },
    });
  };

  [
    ContainerType.Section,
    ContainerType.Subsection,
  ].forEach((cType) => {
    const childType = cType === ContainerType.Section
      ? ContainerType.Subsection
      : ContainerType.Unit;
    let typeNamespace = 'lct';
    if (cType === ContainerType.Unit) {
      typeNamespace = 'lb';
    }
    it(`shows the spinner before the query is complete in ${cType} page`, async () => {
      // This mock will never return data about the collection (it loads forever):
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionIdLoading
        : mockGetContainerMetadata.subsectionIdLoading;
      renderLibrarySectionPage(cId, undefined, cType);
      const spinner = screen.getByRole('status');
      expect(spinner.textContent).toEqual('Loading...');
    });

    it(`shows an error component if no ${cType} returned`, async () => {
      // This mock will simulate incorrect section id
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionIdError
        : mockGetContainerMetadata.subsectionIdError;
      renderLibrarySectionPage(cId, undefined, cType);
      const errorMessage = 'Not found';
      expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    });

    it(`shows ${cType} data`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      renderLibrarySectionPage(cId, undefined, cType);
      expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
      // Container title -- on main page + sidebar
      expect((await screen.findAllByText(`Test ${cType}`))[0]).toBeInTheDocument();
      // Container info button shown
      expect(await screen.findByRole('button', { name: new RegExp(`${cType} Info`, 'i') })).toBeInTheDocument();
      // Reorder children buttons shown
      expect((await screen.findAllByRole('button', { name: 'Drag to reorder' })).length).toEqual(3);
      // Check all children components are rendered only once.
      expect(await screen.findByText(`${childType} block 0`)).toBeInTheDocument();
      expect(await screen.findByText(`${childType} block 1`)).toBeInTheDocument();
      expect(await screen.findByText(`${childType} block 2`)).toBeInTheDocument();
      // Check no Preview tab is shown
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it(`shows ${cType} data with no children`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionIdEmpty
        : mockGetContainerMetadata.subsectionIdEmpty;
      renderLibrarySectionPage(cId, undefined, cType);
      expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
      // Container title -- rendered on main page + sidebar
      expect((await screen.findAllByText(`Test ${cType}`))[0]).toBeInTheDocument();
      // Container info button shown
      expect(await screen.findByRole('button', { name: new RegExp(`${cType} Info`, 'i') })).toBeInTheDocument();
      // Check "no children" text is rendered.
      expect(await screen.findByText(`This ${cType} is empty`)).toBeInTheDocument();
      // Check no Preview tab is shown
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it(`can rename ${cType}`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      renderLibrarySectionPage(cId, undefined, cType);
      expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
      expect((await screen.findAllByText(`Test ${cType}`))[0]).toBeInTheDocument();

      const editContainerTitleButton = (await screen.findAllByRole(
        'button',
        { name: /edit/i },
      ))[0]; // 0 is the Section/Subsection Title, 1 is the first child on the list
      fireEvent.click(editContainerTitleButton);

      const url = getLibraryContainerApiUrl(cId);
      axiosMock.onPatch(url).reply(200);

      expect(await screen.findByRole('textbox', { name: /text input/i })).toBeInTheDocument();

      const textBox = await screen.findByRole('textbox', { name: /text input/i });
      expect(textBox).toBeInTheDocument();
      fireEvent.change(textBox, { target: { value: `New ${cType} Title` } });
      fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(axiosMock.history.patch[0].url).toEqual(url);
      });
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: `New ${cType} Title` }));

      expect(textBox).not.toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith('Container updated successfully.');
    });

    it(`show error if renaming ${cType} fails`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      renderLibrarySectionPage(cId, undefined, cType);
      expect((await screen.findAllByText(libraryTitle))[0]).toBeInTheDocument();
      expect((await screen.findAllByText(`Test ${cType}`))[0]).toBeInTheDocument();

      const editContainerTitleButton = (await screen.findAllByRole(
        'button',
        { name: /edit/i },
      ))[0]; // 0 is the Section/subsection Title, 1 is the first child on the list
      fireEvent.click(editContainerTitleButton);

      const url = getLibraryContainerApiUrl(cId);
      axiosMock.onPatch(url).reply(400);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /text input/i })).toBeInTheDocument();
      });

      const textBox = screen.getByRole('textbox', { name: /text input/i });
      expect(textBox).toBeInTheDocument();
      fireEvent.change(textBox, { target: { value: `New ${cType} Title` } });
      fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(axiosMock.history.patch[0].url).toEqual(url);
      });
      expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ display_name: `New ${cType} Title` }));

      expect(textBox).not.toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith('Failed to update container.');
    });

    it(`should preview child in sidebar by clicking ${childType} on ${cType} page`, async () => {
      const childId = `lct:org1:Demo_course:${childType}:${childType}-0`;
      const url = getLibraryContainerApiUrl(childId);
      axiosMock.onPatch(url).reply(200);
      renderLibrarySectionPage(undefined, undefined, cType);

      // Wait loading of the children
      const child = await screen.findByText(`${childType} block 0`);
      // No Preview tab is shown yet
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();

      // Select the child
      fireEvent.click(child);
      expect((await screen.findAllByText(`${childType} block 0`)).length === 2);

      // Because the Preview show/hide is dependent on the selected item
      // being in the URL, and because our test router doesn't change
      // paths, we have to explicitly navigate to the child page to check
      // the Preview tab is shown. Boo.
      renderLibrarySectionPage(undefined, undefined, cType, childId);
      expect((await screen.findAllByText(`${childType} block 0`)).length === 2);
      expect(await screen.findByText('Preview')).toBeInTheDocument();
    });

    it(`should rename child by clicking edit icon besides name in ${cType} page`, async () => {
      const mockSetQueryData = jest.spyOn(queryClient, 'setQueryData');
      const url = getLibraryContainerApiUrl(`${typeNamespace}:org1:Demo_course_generated:${childType}:${childType}-0`);
      axiosMock.onPatch(url).reply(200);
      renderLibrarySectionPage(undefined, undefined, cType);

      // Wait loading of the children
      await screen.findByText(`${childType} block 0`);

      const editButton = (await screen.findAllByRole(
        'button',
        { name: /edit/i },
      ))[1]; // 0 is the Section Title, 1 is the first subsection on the list
      fireEvent.click(editButton);

      expect(await screen.findByRole('textbox', { name: /text input/i })).toBeInTheDocument();

      const textBox = await screen.findByRole('textbox', { name: /text input/i });
      expect(textBox).toBeInTheDocument();
      fireEvent.change(textBox, { target: { value: `New ${childType} Title` } });
      fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(axiosMock.history.patch.length).toEqual(1);
      });
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toStrictEqual(JSON.stringify({
        display_name: `New ${childType} Title`,
      }));
      expect(textBox).not.toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith('Container updated successfully.');
      expect(mockSetQueryData).toHaveBeenCalledTimes(1);
    });

    it(`should show error while updating child name in ${cType} page`, async () => {
      const url = getLibraryContainerApiUrl(`${typeNamespace}:org1:Demo_course_generated:${childType}:${childType}-0`);
      axiosMock.onPatch(url).reply(400);
      renderLibrarySectionPage(undefined, undefined, cType);

      // Wait loading of the children
      await screen.findByText(`${childType} block 0`);

      const editButton = screen.getAllByRole(
        'button',
        { name: /edit/i },
      )[1]; // 0 is the Section Title, 1 is the first subsection on the list
      fireEvent.click(editButton);

      expect(await screen.findByRole('textbox', { name: /text input/i })).toBeInTheDocument();

      const textBox = await screen.findByRole('textbox', { name: /text input/i });
      expect(textBox).toBeInTheDocument();
      fireEvent.change(textBox, { target: { value: `New ${childType} Title` } });
      fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(axiosMock.history.patch.length).toEqual(1);
      });
      expect(axiosMock.history.patch[0].url).toEqual(url);
      expect(axiosMock.history.patch[0].data).toStrictEqual(JSON.stringify({
        display_name: `New ${childType} Title`,
      }));
      expect(textBox).not.toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith('Failed to update container.');
    });

    it(`should call update order api on dragging children in ${cType} page`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      renderLibrarySectionPage(cId, undefined, cType);
      const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
      axiosMock
        .onPatch(getLibraryContainerChildrenApiUrl(cId))
        .reply(200);
      verticalSortableListCollisionDetection.mockReturnValue([{
        id: `${typeNamespace}:org1:Demo_course_generated:${childType}:${childType}-1----1`,
      }]);
      await act(async () => {
        fireEvent.keyDown(firstDragHandle, { code: 'Space' });
      });
      setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Space' }));
      await waitFor(() => expect(mockShowToast).toHaveBeenLastCalledWith('Order updated'));
    });

    it(`should cancel update order api on cancelling dragging component in ${cType} page`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      renderLibrarySectionPage(cId, undefined, cType);
      const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
      axiosMock
        .onPatch(getLibraryContainerChildrenApiUrl(cId))
        .reply(200);
      verticalSortableListCollisionDetection.mockReturnValue([{
        id: `${typeNamespace}:org1:Demo_course_generated:${childType}:${childType}-1----1`,
      }]);
      await act(async () => {
        fireEvent.keyDown(firstDragHandle, { code: 'Space' });
      });
      setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Escape' }));
      await waitFor(() => expect(mockShowToast).not.toHaveBeenLastCalledWith('Order updated'));
    });

    it(`should show toast error message on update order failure in ${cType} page`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      renderLibrarySectionPage(cId, undefined, cType);
      const firstDragHandle = (await screen.findAllByRole('button', { name: 'Drag to reorder' }))[0];
      axiosMock
        .onPatch(getLibraryContainerChildrenApiUrl(cId))
        .reply(500);
      verticalSortableListCollisionDetection.mockReturnValue([{
        id: `${typeNamespace}:org1:Demo_course_generated:${childType}:${childType}-1----1`,
      }]);
      await act(async () => {
        fireEvent.keyDown(firstDragHandle, { code: 'Space' });
      });
      setTimeout(() => fireEvent.keyDown(firstDragHandle, { code: 'Space' }));
      await waitFor(() => expect(mockShowToast).toHaveBeenLastCalledWith('Failed to update children order'));
    });

    it(`should open ${childType} page on double click`, async () => {
      const user = userEvent.setup();
      renderLibrarySectionPage(undefined, undefined, cType);
      const child = await screen.findByText(`${childType} block 0`);
      // Trigger double click. Find the child card as the parent element
      await user.dblClick(child.parentElement!.parentElement!.parentElement!);
      expect((await screen.findAllByText(new RegExp(`${childType} block 0`, 'i')))[0]).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: new RegExp(`${childType} Info`, 'i') })).toBeInTheDocument();
    });

    it(`${cType} sidebar should render "new ${childType}" and "existing ${childType}" buttons`, async () => {
      const user = userEvent.setup();
      renderLibrarySectionPage(undefined, undefined, cType);
      const addChild = await screen.findByRole('button', { name: new RegExp(`add ${childType}`, 'i') });
      await user.click(addChild);
      const addNew = await screen.findByRole('button', { name: new RegExp(`^new ${childType}$`, 'i') });
      const addExisting = await screen.findByRole('button', { name: new RegExp(`^existing ${childType}$`, 'i') });

      // Clicking "add new" shows create container modal (tested below)
      await user.click(addNew);
      expect(await screen.findByLabelText(new RegExp(`name your ${childType}`, 'i'))).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // Clicking "add existing" shows content picker modal
      await user.click(addExisting);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: new RegExp(`add to ${cType}`, 'i') })).toBeInTheDocument();
      // No "Types" filter shown
      expect(screen.queryByRole('button', { name: /type/i })).not.toBeInTheDocument();
    });

    it(`"add new" button should add ${childType} to the ${cType}`, async () => {
      const user = userEvent.setup();
      const { libraryId } = mockContentLibrary;
      const containerId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      const childId = cType === ContainerType.Section
        ? mockGetContainerMetadata.subsectionId
        : mockGetContainerMetadata.unitId;

      axiosMock
        .onPost(getLibraryContainersApiUrl(libraryId))
        .reply(200, { id: childId });
      axiosMock
        .onPost(getLibraryContainerChildrenApiUrl(containerId))
        .reply(200);
      renderLibrarySectionPage(containerId, libraryId, cType);

      const addChild = await screen.findByRole('button', { name: new RegExp(`add new ${childType}`, 'i') });
      await user.click(addChild);
      const textBox = await screen.findByLabelText(new RegExp(`name your ${childType}`, 'i'));
      fireEvent.change(textBox, { target: { value: `New ${childType} Title` } });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));
      await waitFor(() => {
        expect(axiosMock.history.post.length).toEqual(2);
      });
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({
        can_stand_alone: false,
        container_type: childType,
        display_name: `New ${childType} Title`,
      }));
      expect(axiosMock.history.post[1].data).toEqual(JSON.stringify({ usage_keys: [childId] }));
      expect(textBox).not.toBeInTheDocument();
      const childTypeTitle = childType.charAt(0).toUpperCase() + childType.slice(1);
      expect(mockShowToast).toHaveBeenCalledWith(`${childTypeTitle} created successfully`);
    });

    it(`"add new" button should show error when adding ${childType} to the ${cType}`, async () => {
      const user = userEvent.setup();
      const { libraryId } = mockContentLibrary;
      const containerId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      const childId = cType === ContainerType.Section
        ? mockGetContainerMetadata.subsectionId
        : mockGetContainerMetadata.unitId;

      axiosMock
        .onPost(getLibraryContainersApiUrl(libraryId))
        .reply(200, { id: childId });
      axiosMock
        .onPost(getLibraryContainerChildrenApiUrl(containerId))
        .reply(500);
      renderLibrarySectionPage(containerId, libraryId, cType);

      const addChild = await screen.findByRole('button', { name: new RegExp(`add new ${childType}`, 'i') });
      await user.click(addChild);
      const textBox = await screen.findByLabelText(new RegExp(`name your ${childType}`, 'i'));
      fireEvent.change(textBox, { target: { value: `New ${childType} Title` } });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));
      await waitFor(() => {
        expect(axiosMock.history.post.length).toEqual(2);
      });
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({
        can_stand_alone: false,
        container_type: childType,
        display_name: `New ${childType} Title`,
      }));
      expect(axiosMock.history.post[1].data).toEqual(JSON.stringify({ usage_keys: [childId] }));
      expect(textBox).not.toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith(`There is an error when creating the library ${childType}`);
    });

    it(`"add existing ${childType}" button should load ${cType} content picker modal`, async () => {
      const user = userEvent.setup();
      renderLibrarySectionPage(undefined, undefined, cType);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const addChild = await screen.findByRole('button', { name: new RegExp(`add existing ${childType}`, 'i') });
      await user.click(addChild);

      // Content picker loaded (modal behavior is tested elsewhere)
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: new RegExp(`add to ${cType}`, 'i') })).toBeInTheDocument();
    });

    it(`should open manage tags on click tag count in ${cType} page`, async () => {
      const cId = cType === ContainerType.Section
        ? mockGetContainerMetadata.sectionId
        : mockGetContainerMetadata.subsectionId;
      renderLibrarySectionPage(cId, undefined, cType);
      // check all children components are rendered.
      expect((await screen.findAllByText(`${childType} block 0`))[0]).toBeInTheDocument();
      expect((await screen.findAllByText(`${childType} block 1`))[0]).toBeInTheDocument();
      expect((await screen.findAllByText(`${childType} block 2`))[0]).toBeInTheDocument();

      const tagCountButton = screen.getAllByRole('button', { name: '0' })[0];
      fireEvent.click(tagCountButton);

      expect(await screen.findByTestId('library-sidebar')).toBeInTheDocument();
      await waitFor(
        () => expect(screen.getByRole('tab', { name: /manage/i })).toHaveClass('active'),
        { timeout: 300 },
      );
    });
  });
});
