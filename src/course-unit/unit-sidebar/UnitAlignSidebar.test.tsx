import { render, screen, initializeMocks } from '@src/testUtils';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { UnitAlignSidebar } from './UnitAlignSidebar';
import { UnitSidebarProvider } from './UnitSidebarContext';

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsDrawer: jest.fn(({ id, variant, readOnly }) => (
    <div data-testid="content-tags-drawer">
      drawer-mock-{id}-{variant}-{String(readOnly)}
    </div>
  )),
}));

jest.mock('@src/authz/hooks', () => ({
  ...jest.requireActual('@src/authz/hooks'),
  useCourseUserPermissions: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ blockId: 'unit-id-1' }),
}));

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId="course-v1:test+course+run">
      <IframeProvider>
        <UnitSidebarProvider readOnly={false}>
          <UnitAlignSidebar />
        </UnitSidebarProvider>
      </IframeProvider>
    </CourseAuthoringProvider>,
  );

describe('OutlineAlignSidebar', () => {
  beforeEach(() => {
    initializeMocks();
    jest.mocked(useCourseUserPermissions).mockReturnValue({
      canManageTags: true,
      isLoading: false,
      isAuthzEnabled: false,
    } as ReturnType<typeof useCourseUserPermissions>);
  });

  it('renders ContentTagsDrawer with the correct id and variant', () => {
    renderComponent();

    const drawer = screen.getByTestId('content-tags-drawer');

    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveTextContent(
      'drawer-mock-unit-id-1-component-false',
    );
  });

  it('renders ContentTagsDrawer in read-only mode when user cannot manage tags', () => {
    jest.mocked(useCourseUserPermissions).mockReturnValue({
      canManageTags: false,
      isLoading: false,
      isAuthzEnabled: false,
    } as ReturnType<typeof useCourseUserPermissions>);
    renderComponent();

    expect(screen.getByTestId('content-tags-drawer')).toHaveTextContent(
      'drawer-mock-unit-id-1-component-true',
    );
  });
});
