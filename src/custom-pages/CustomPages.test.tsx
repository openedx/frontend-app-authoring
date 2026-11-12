import ReactDOM from 'react-dom';
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

import {
  initializeMocks,
  fireEvent,
  screen,
  waitFor,
  render,
  act,
  userEvent,
} from '@src/testUtils';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { getCourseDetailsUrl } from '@src/data/api';
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
let validateUserPermissionsMock;
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
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    mockWaffleFlags();
    axiosMock.onGet(getCourseDetailsUrl(courseId, 'abc123')).reply(200, mockCourseDetails);
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

  describe('with AuthZ enabled', () => {
    const customPagesPath = `/course/${courseId}/custom-pages`;

    const mockPermissions = (canManagePagesAndResources: boolean) => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      validateUserPermissionsMock.mockResolvedValue({ canViewPagesAndResources: true, canManagePagesAndResources });
    };

    const Location = () => {
      const { pathname } = useLocation();
      return <output aria-label="Current location">{`${useNavigationType()} ${pathname}`}</output>;
    };

    const renderRoute = (route: string) =>
      render(
        <CourseAuthoringProvider courseId={courseId}>
          <Location />
          <Routes>
            <Route path="/course/:courseId/custom-pages/*" element={<CustomPages />} />
          </Routes>
        </CourseAuthoringProvider>,
        { routerProps: { initialEntries: [`${customPagesPath}${route}`] } },
      );

    beforeEach(() => {
      axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, [
        { ...generateFetchPageApiResponse()[0], id: 'mOckID1', name: 'Page 1' },
        { ...generateFetchPageApiResponse()[0], id: 'mOckID2', name: 'Page 2', tab_id: 'static_tab_2' },
      ]);
    });

    it('shows view-only users the read-only alert instead of management actions', async () => {
      mockPermissions(false);
      const user = userEvent.setup();
      renderRoute('');

      expect(await screen.findByText('Page 1')).toBeVisible();
      expect(screen.getByRole('alert')).toHaveTextContent(/You have view-only access to this page/);
      for (
        const name of [
          messages.addPageHeaderLabel.defaultMessage,
          messages.addPageBodyLabel.defaultMessage,
          messages.editTooltipContent.defaultMessage,
          messages.deleteTooltipContent.defaultMessage,
          messages.visibilityTooltipContent.defaultMessage,
          // Without drag handles there is no pointer or keyboard entry point for reordering.
          'Drag to reorder',
        ]
      ) {
        expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
      }

      expect(screen.getByRole('link', { name: messages.viewLiveLabel.defaultMessage })).toBeVisible();
      await user.click(screen.getByRole('button', { name: messages.studentViewExampleButton.defaultMessage }));
      expect(await screen.findByRole('dialog', { name: messages.studentViewModalTitle.defaultMessage })).toBeVisible();
    });

    it('redirects view-only editor visits to the listing, replacing the history entry', async () => {
      mockPermissions(false);
      renderRoute('/editor');

      expect(await screen.findByText('Page 1')).toBeVisible();
      await waitFor(() =>
        expect(screen.getByLabelText('Current location').textContent).toBe(`REPLACE ${customPagesPath}`)
      );
      expect(screen.queryByTestId('edit-modal-mock')).not.toBeInTheDocument();
    });

    it('keeps management actions available to managers', async () => {
      mockPermissions(true);
      renderRoute('');

      expect(await screen.findByText('Page 1')).toBeVisible();
      expect(screen.queryByText(/You have view-only access to this page/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: messages.addPageHeaderLabel.defaultMessage })).toBeEnabled();
      expect(screen.getByRole('button', { name: messages.addPageBodyLabel.defaultMessage })).toBeEnabled();
      for (
        const name of [
          messages.editTooltipContent.defaultMessage,
          messages.deleteTooltipContent.defaultMessage,
          messages.visibilityTooltipContent.defaultMessage,
          'Drag to reorder',
        ]
      ) {
        const buttons = screen.getAllByRole('button', { name });
        expect(buttons).toHaveLength(2);
        buttons.forEach(button => expect(button).toBeEnabled());
      }
    });

    it('keeps the pending Add Page action unavailable to managers', async () => {
      mockPermissions(true);
      let finishAdding!: () => void;
      const pending = new Promise<void>(resolve => {
        finishAdding = resolve;
      });
      axiosMock.onPut(`${getApiBaseUrl()}/xblock/`).reply(async () => {
        await pending;
        return [200, generateNewPageApiResponse()];
      });
      const user = userEvent.setup();
      renderRoute('');

      await user.click(await screen.findByRole('button', { name: messages.addPageBodyLabel.defaultMessage }));
      const pendingButton = await screen.findByRole('button', { name: messages.addingPageBodyLabel.defaultMessage });
      expect(pendingButton).toHaveAttribute('aria-disabled', 'true');
      await user.click(pendingButton);
      expect(axiosMock.history.put).toHaveLength(1);
      await act(async () => {
        finishAdding();
      });
      expect(await screen.findByRole('button', { name: messages.addPageBodyLabel.defaultMessage })).toBeEnabled();
    });
  });
});
