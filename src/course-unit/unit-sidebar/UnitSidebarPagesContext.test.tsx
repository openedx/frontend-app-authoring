import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useUnitSidebarContext } from './UnitSidebarContext';
import { UnitSidebarPagesProvider, useUnitSidebarPagesContext } from './UnitSidebarPagesContext';

jest.mock('./UnitSidebarContext', () => ({
  useUnitSidebarContext: jest.fn(),
}));

const mockUseUnitSidebarContext = useUnitSidebarContext as jest.Mock;

/**
 * Test consumer that renders one node per available sidebar page so the tests can assert
 * which pages the provider exposes (and whether they are disabled).
 */
const PagesConsumer = () => {
  const pages = useUnitSidebarPagesContext();
  return (
    <div>
      {Object.entries(pages).map(([key, page]) => (
        <div
          key={key}
          data-testid={`page-${key}`}
          data-disabled={page?.disabled ? 'true' : 'false'}
        >
          {key}
        </div>
      ))}
    </div>
  );
};

const WrapperProvider = ({ children }) => (
  <CourseAuthoringProvider courseId={'courseId'}>{children}</CourseAuthoringProvider>
);

const renderComponent = () =>
  render(
    <UnitSidebarPagesProvider>
      <PagesConsumer />
    </UnitSidebarPagesProvider>,
    { extraWrapper: WrapperProvider },
  );

describe('<UnitSidebarPagesProvider />', () => {
  let validateUserPermissionsMock;

  beforeEach(() => {
    const mocks = initializeMocks();
    mockUseUnitSidebarContext.mockReturnValue({
      readOnly: false,
      selectedComponentId: undefined,
      currentItemCategory: 'vertical',
    });
    // Authz must be enabled for the mocked permissions to take effect; otherwise
    // `useCourseUserPermissions` falls back to granting every permission (`true`).
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: true,
    });
  });

  it('always exposes the info page', async () => {
    renderComponent();

    expect(await screen.findByTestId('page-info')).toBeInTheDocument();
  });

  it('includes the add page when the user can edit course content and it is not read-only', async () => {
    renderComponent();

    // The add page is gated behind `canEditCourseContent`, which is only known once the (async)
    // permissions query resolves, so wait for it rather than querying synchronously.
    expect(await screen.findByTestId('page-add')).toBeInTheDocument();
  });

  it('excludes the add page when the user cannot edit course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: false,
    });
    renderComponent();

    // Info always renders; wait for the permissions query to settle, then confirm the add page is gone.
    expect(await screen.findByTestId('page-info')).toBeInTheDocument();
    await waitFor(() => expect(validateUserPermissionsMock).toHaveBeenCalled());
    expect(screen.queryByTestId('page-add')).not.toBeInTheDocument();
  });

  it('excludes the add page when the sidebar is read-only even if the user can edit', async () => {
    mockUseUnitSidebarContext.mockReturnValue({
      readOnly: true,
      selectedComponentId: undefined,
      currentItemCategory: 'vertical',
    });
    renderComponent();

    expect(await screen.findByTestId('page-info')).toBeInTheDocument();
    await waitFor(() => expect(validateUserPermissionsMock).toHaveBeenCalled());
    expect(screen.queryByTestId('page-add')).not.toBeInTheDocument();
  });

  it('marks the add page as disabled when a component is selected', async () => {
    mockUseUnitSidebarContext.mockReturnValue({
      readOnly: false,
      selectedComponentId: 'block-v1:org+course+run+type@html+block@test',
      currentItemCategory: 'vertical',
    });
    renderComponent();

    const addPage = await screen.findByTestId('page-add');
    expect(addPage).toHaveAttribute('data-disabled', 'true');
  });
});
