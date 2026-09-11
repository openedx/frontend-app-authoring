import { render, screen, initializeMocks } from '@src/testUtils';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ blockId: 'unit-id-1' }),
}));

let validateUserPermissionsMock: ReturnType<typeof initializeMocks>['validateUserPermissionsMock'];

/**
 * Authz is only consulted when its waffle flag is on; with the flag off every permission is
 * granted, so only the restricted cases need to enable it.
 */
const mockPermissions = (canManageTags = true) => {
  mockWaffleFlags({ enableAuthzCourseAuthoring: !canManageTags });
  validateUserPermissionsMock.mockResolvedValue({ canManageTags });
};

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
    const mocks = initializeMocks();
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    mockPermissions();
  });

  it('renders ContentTagsDrawer with the correct id and variant', () => {
    renderComponent();

    const drawer = screen.getByTestId('content-tags-drawer');

    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveTextContent(
      'drawer-mock-unit-id-1-component-false',
    );
  });

  it('renders ContentTagsDrawer in read-only mode when user cannot manage tags', async () => {
    mockPermissions(false);
    renderComponent();

    expect(await screen.findByTestId('content-tags-drawer')).toHaveTextContent(
      'drawer-mock-unit-id-1-component-true',
    );
  });
});
