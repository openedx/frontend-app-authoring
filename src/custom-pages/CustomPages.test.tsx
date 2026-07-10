import ReactDOM from 'react-dom';

import {
  initializeMocks,
  fireEvent,
  screen,
  waitFor,
  render,
  act,
} from '@src/testUtils';
import { getApiWaffleFlagsUrl } from '@src/data/api';
import { useCourseDetails } from '@src/data/apiHooks';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import CustomPages from './CustomPages';
import { getApiBaseUrl, getTabHandlerUrl } from './data/api';
import { customPagesQueryKeys } from './data/apiHooks';
import messages from './messages';

jest.mock('@src/generic/DraggableList/verticalSortableList', () => ({
  verticalSortableListCollisionDetection: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

let capturedOnClose: ((...args: any[]) => any) | undefined;
jest.mock('./EditModal', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: (...args: any[]) => any; }) => {
    capturedOnClose = onClose;
    return <div data-testid="edit-modal-mock" />;
  },
}));

let axiosMock;
let queryClient;
// @ts-ignore
ReactDOM.createPortal = jest.fn(node => node);

const courseId = 'course-v1:edX+DemoX+Demo_Course';

const generateFetchPageApiResponse = () => [{
  type: 'static_tab',
  title: null,
  is_hideable: false,
  is_hidden: false,
  is_movable: true,
  course_staff_only: false,
  name: 'test',
  tab_id: 'static_tab_1',
  settings: { url_slug: '1' },
  id: 'mOckID1',
}];

const generateNewPageApiResponse = () => ({
  locator: 'mOckID2',
  courseKey: courseId,
});

jest.mock('@src/data/apiHooks', () => ({
  ...jest.requireActual('@src/data/apiHooks'),
  useCourseDetails: jest.fn(),
}));

const mockCourseDetails = {
  name: 'Test Course',
  start: '2024-01-01T00:00:00Z',
};

const renderComponent = () => {
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CustomPages />
    </CourseAuthoringProvider>,
  );
};

describe('CustomPages', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    queryClient = mocks.queryClient;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {});
    (useCourseDetails as jest.Mock).mockReturnValue({
      data: mockCourseDetails,
      status: 'successful',
    });
    capturedOnClose = undefined;
    mockNavigate.mockClear();
  });

  it('should render placeholder on 403', async () => {
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(403);
    renderComponent();
    expect(await screen.findByTestId('under-construction-placeholder')).toBeVisible();
  });

  it('should render placeholder on 403 even with cached pages', async () => {
    // Seed the query cache with pages simulating a prior successful fetch
    queryClient.setQueryData(customPagesQueryKeys.list(courseId), generateFetchPageApiResponse());
    // API returns 403 on the subsequent refetch triggered by staleTime: 0
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(403);
    renderComponent();
    expect(await screen.findByTestId('under-construction-placeholder')).toBeVisible();
  });

  it('should add new page when "add a new page button" is clicked', async () => {
    const xblockAddUrl = `${getApiBaseUrl()}/xblock/`;
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    axiosMock.onPut(xblockAddUrl).reply(200, generateNewPageApiResponse());

    renderComponent();
    const addButton = await screen.findByTestId('body-add-button');
    expect(addButton).toBeVisible();

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should post reordered pages to /reorder endpoint', async () => {
    const { verticalSortableListCollisionDetection } = await import('@src/generic/DraggableList/verticalSortableList');
    const twoPages = [
      { ...generateFetchPageApiResponse()[0], id: 'mOckID1', name: 'Page 1' },
      { ...generateFetchPageApiResponse()[0], id: 'mOckID2', name: 'Page 2', tab_id: 'static_tab_2' },
    ];
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, twoPages);
    const reorderUrl = `${getTabHandlerUrl(courseId)}/reorder`;
    axiosMock.onPost(reorderUrl).reply(204);

    // Mock collision detection so keyboard drag lands on the second page
    jest.mocked(verticalSortableListCollisionDetection).mockReturnValue([{ id: 'mOckID2' }]);

    renderComponent();

    const dragHandles = await screen.findAllByRole('button', { name: 'Drag to reorder' });
    expect(dragHandles).toHaveLength(2);

    // Start keyboard drag on the first page
    fireEvent.keyDown(dragHandles[0], { code: 'Space' });
    await act(() =>
      new Promise(r => {
        setTimeout(r, 1);
      })
    );
    // Drop — verticalSortableListCollisionDetection mock reports 'mOckID2' as over
    fireEvent.keyDown(dragHandles[0], { code: 'Space' });

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBeGreaterThanOrEqual(1);
    });

    const postData = JSON.parse(axiosMock.history.post[0].data);
    expect(postData).toEqual([
      { tab_locator: 'mOckID2' },
      { tab_locator: 'mOckID1' },
    ]);
  });

  it('should delete page on successful delete', async () => {
    const pageId = 'mOckID1';
    const xblockEditUrl = `${getApiBaseUrl()}/xblock/${pageId}`;
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    axiosMock.onDelete(xblockEditUrl).reply(204);

    renderComponent();
    expect(await screen.findByTestId('delete-modal-icon')).toBeVisible();
    fireEvent.click(screen.getByTestId('delete-modal-icon'));
    fireEvent.click(screen.getByText(messages.deletePageLabel.defaultMessage));

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
  });

  it('should show error alert on delete failure', async () => {
    const pageId = 'mOckID1';
    const xblockEditUrl = `${getApiBaseUrl()}/xblock/${pageId}`;
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    axiosMock.onDelete(xblockEditUrl).reply(500);

    renderComponent();
    expect(await screen.findByTestId('delete-modal-icon')).toBeVisible();
    fireEvent.click(screen.getByTestId('delete-modal-icon'));
    fireEvent.click(screen.getByText(messages.deletePageLabel.defaultMessage));

    await waitFor(() => {
      expect(screen.getByText('Unable to delete page. Please try again.')).toBeVisible();
    });
  });

  it('should navigate back and update cached name when editor closes with metadata', async () => {
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    queryClient.setQueryData(customPagesQueryKeys.list(courseId), generateFetchPageApiResponse());

    render(
      <CourseAuthoringProvider courseId={courseId}>
        <CustomPages />
      </CourseAuthoringProvider>,
      { routerProps: { initialEntries: ['/editor'] } },
    );

    const editIcon = await screen.findByTestId('edit-modal-icon');
    fireEvent.click(editIcon);

    expect(screen.getByTestId('edit-modal-mock')).toBeVisible();

    const closeHandler = capturedOnClose!();
    closeHandler({ metadata: { display_name: 'Updated Name' } });

    expect(mockNavigate).toHaveBeenCalledWith(`/course/${courseId}/custom-pages`);

    await waitFor(() => {
      const cached: any[] | undefined = queryClient.getQueryData(customPagesQueryKeys.list(courseId));
      expect(cached![0].name).toBe('Updated Name');
    });
  });

  it('should navigate back and leave name unchanged when editor closes without metadata', async () => {
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    queryClient.setQueryData(customPagesQueryKeys.list(courseId), generateFetchPageApiResponse());

    render(
      <CourseAuthoringProvider courseId={courseId}>
        <CustomPages />
      </CourseAuthoringProvider>,
      { routerProps: { initialEntries: ['/editor'] } },
    );

    const editIcon = await screen.findByTestId('edit-modal-icon');
    fireEvent.click(editIcon);

    expect(screen.getByTestId('edit-modal-mock')).toBeVisible();

    const closeHandler = capturedOnClose!();
    closeHandler({});

    expect(mockNavigate).toHaveBeenCalledWith(`/course/${courseId}/custom-pages`);

    const cached: any[] | undefined = queryClient.getQueryData(customPagesQueryKeys.list(courseId));
    expect(cached![0].name).toBe('test');
  });

  it('should save visibility on successful toggle', async () => {
    const pageId = 'mOckID1';
    const xblockEditUrl = `${getApiBaseUrl()}/xblock/${pageId}`;
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    axiosMock.onPut(xblockEditUrl).reply(200, {});

    renderComponent();
    expect(await screen.findByTestId('visibility-toggle-icon')).toBeVisible();
    fireEvent.click(screen.getByTestId('visibility-toggle-icon'));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should show error alert on visibility save failure', async () => {
    const pageId = 'mOckID1';
    const xblockEditUrl = `${getApiBaseUrl()}/xblock/${pageId}`;
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    axiosMock.onPut(xblockEditUrl).reply(500);

    renderComponent();
    expect(await screen.findByTestId('visibility-toggle-icon')).toBeVisible();
    fireEvent.click(screen.getByTestId('visibility-toggle-icon'));

    await waitFor(() => {
      expect(screen.getByText('Unable to save page. Please try again.')).toBeVisible();
    });
  });
});
