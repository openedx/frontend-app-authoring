import { useLocation, useNavigate } from 'react-router-dom';
import { PermissionValidationAnswer, PermissionValidationQuery } from '@src/authz/types';
import CourseAuthoringRoutes from './CourseAuthoringRoutes';
import { getCourseDetailsUrl } from './data/api';
import { mockWaffleFlags } from './data/apiHooks.mock';
import {
  act,
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from './testUtils';

const courseId = 'course-v1:edX+TestX+Test_Course';
const otherCourseId = 'course-v1:edX+Other+Course';
const coursePath = `/course/${courseId}`;
const pagesAndResourcesMockText = 'Pages And Resources';
const editorContainerMockText = 'Editor Container';
const videoSelectorContainerMockText = 'Video Selector Container';
const customPagesMockText = 'Custom Pages';
const textbooksMockText = 'Textbooks';
const deniedText = /You are not authorized to view this page/;
const mockComponentFn = jest.fn();

// Mock the TinyMceWidget
jest.mock('./editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true, // Required to mock a default export
  default: () => <div>Widget</div>,
  Footer: () => <div>Footer</div>,
  useEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('useEditorRef.setEditorRef'),
  })),
}));

jest.mock('./pages-and-resources/PagesAndResources', () => (props: object) => {
  mockComponentFn(props);
  return pagesAndResourcesMockText;
});
jest.mock('./editors/EditorContainer', () => (props: object) => {
  mockComponentFn(props);
  return editorContainerMockText;
});
jest.mock('./selectors/VideoSelectorContainer', () => (props: object) => {
  mockComponentFn(props);
  return videoSelectorContainerMockText;
});
jest.mock('./custom-pages/CustomPages', () => (props: object) => {
  mockComponentFn(props);
  return customPagesMockText;
});
jest.mock('./textbooks/Textbooks', () => (props: object) => {
  mockComponentFn(props);
  return textbooksMockText;
});

let validateUserPermissionsMock: ReturnType<typeof initializeMocks>['validateUserPermissionsMock'];

const CourseSwitcher = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label="Current location">{pathname}</output>
      <button onClick={() => navigate(`/course/${otherCourseId}/custom-pages`)}>Open another course</button>
    </>
  );
};

const renderRoute = (route: string) =>
  render(
    <>
      <CourseSwitcher />
      <CourseAuthoringRoutes />
    </>,
    { path: '/course/:courseId/*', routerProps: { initialEntries: [`${coursePath}/${route}`] } },
  );

const mockPagesAndResourcesPermissions = (view: boolean, manage: boolean) =>
  validateUserPermissionsMock.mockResolvedValue({ canViewPagesAndResources: view, canManagePagesAndResources: manage });

const guardedRoutes = [
  ['pages-and-resources', pagesAndResourcesMockText],
  ['pages-and-resources/calculator/settings', pagesAndResourcesMockText],
  ['custom-pages', customPagesMockText],
  ['textbooks', textbooksMockText],
];

describe('<CourseAuthoringRoutes>', () => {
  beforeEach(() => {
    const mocks = initializeMocks({ user: { userId: 1, username: 'username' } });
    const { axiosMock } = mocks;
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    mockWaffleFlags();
    axiosMock.onGet(getCourseDetailsUrl(courseId, 'username')).reply(200, { course_id: courseId, name: 'Test course' });
    axiosMock.onGet(getCourseDetailsUrl(otherCourseId, 'username')).reply(200, {
      course_id: otherCourseId,
      name: 'Other course',
    });
  });

  it('renders the PagesAndResources component when the pages and resources route is active', async () => {
    renderRoute('pages-and-resources');

    expect(await screen.findByText(pagesAndResourcesMockText)).toBeVisible();
    expect(mockComponentFn).toHaveBeenCalled();
  });

  it('renders the EditorContainer component when the course editor route is active', async () => {
    renderRoute('editor/video/block-id');

    expect(await screen.findByText(editorContainerMockText)).toBeVisible();
    expect(screen.queryByText(pagesAndResourcesMockText)).not.toBeInTheDocument();
    expect(mockComponentFn).toHaveBeenCalledWith(expect.objectContaining({ learningContextId: courseId }));
  });

  it('renders the VideoSelectorContainer component when the course videos route is active', async () => {
    renderRoute('editor/course-videos/block-id');

    expect(await screen.findByText(videoSelectorContainerMockText)).toBeVisible();
    expect(screen.queryByText(pagesAndResourcesMockText)).not.toBeInTheDocument();
  });

  describe('Pages & Resources access guard', () => {
    beforeEach(() => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    });

    it.each(guardedRoutes)('denies %s without Pages & Resources permissions', async (route, text) => {
      mockPagesAndResourcesPermissions(false, false);
      renderRoute(route);

      expect(await screen.findByText(deniedText)).toBeVisible();
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    it.each(guardedRoutes)('renders %s for view-only users', async (route, text) => {
      mockPagesAndResourcesPermissions(true, false);
      renderRoute(route);

      expect(await screen.findByText(text)).toBeVisible();
    });

    it.each(guardedRoutes)('renders %s for managers', async (route, text) => {
      mockPagesAndResourcesPermissions(true, true);
      renderRoute(route);

      expect(await screen.findByText(text)).toBeVisible();
    });

    it.each(guardedRoutes)('withholds %s while permissions are loading', async (route, text) => {
      let finishValidation!: () => void;
      const pending = new Promise<void>(resolve => {
        finishValidation = resolve;
      });
      validateUserPermissionsMock.mockImplementation(async query => {
        await pending;
        return Object.fromEntries(Object.keys(query).map(key => [key, true])) as PermissionValidationAnswer;
      });
      renderRoute(route);

      await waitFor(() => expect(validateUserPermissionsMock).toHaveBeenCalled());
      expect(screen.queryByText(text)).not.toBeInTheDocument();
      expect(screen.queryByText(deniedText)).not.toBeInTheDocument();

      await act(async () => {
        finishValidation();
      });
      expect(await screen.findByText(text)).toBeVisible();
    });

    it.each(guardedRoutes)('fails closed on %s when permission validation fails', async (route, text) => {
      validateUserPermissionsMock.mockRejectedValue(new Error('Permission validation failed'));
      renderRoute(route);

      expect(await screen.findByText(deniedText)).toBeVisible();
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    it.each(guardedRoutes)('fails closed on %s when permissions are missing', async (route, text) => {
      validateUserPermissionsMock.mockResolvedValue({});
      renderRoute(route);

      expect(await screen.findByText(deniedText)).toBeVisible();
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    it('uses the destination course permissions when switching courses', async () => {
      validateUserPermissionsMock.mockImplementation(async (query: PermissionValidationQuery) =>
        Object.fromEntries(Object.entries(query).map(([key, { scope }]) => [key, scope === courseId]))
      );
      const user = userEvent.setup();
      renderRoute('custom-pages');

      expect(await screen.findByText(customPagesMockText)).toBeVisible();
      await user.click(screen.getByRole('button', { name: 'Open another course' }));

      expect(await screen.findByText(deniedText)).toBeVisible();
      expect(screen.queryByText(customPagesMockText)).not.toBeInTheDocument();
    });

    it('does not guard unrelated authoring routes', async () => {
      mockPagesAndResourcesPermissions(false, false);
      renderRoute('editor/video/block-id');

      expect(await screen.findByText(editorContainerMockText)).toBeVisible();
      expect(screen.queryByText(deniedText)).not.toBeInTheDocument();
    });
  });

  it.each(guardedRoutes)('preserves legacy access to %s with AuthZ disabled', async (route, text) => {
    renderRoute(route);

    expect(await screen.findByText(text)).toBeVisible();
    expect(validateUserPermissionsMock).not.toHaveBeenCalled();
  });
});
