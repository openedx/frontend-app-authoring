import { initializeMocks, render, screen, userEvent } from '@src/testUtils';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockContentTaxonomyTagsData } from '@src/content-tags-drawer/data/api.mocks';
import { CourseInfoSidebar } from './CourseInfoSidebar';

const courseId = mockContentTaxonomyTagsData.otherTagsId;

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useCourseDetails: () => ({ data: { title: 'Test Course' } }),
}));

jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: () => ({ data: [] }),
}));

jest.mock('../OutlineSidebarContext', () => ({
  ...jest.requireActual('../OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    currentTabKey: 'info',
    setCurrentTabKey: jest.fn(),
  }),
}));

mockContentTaxonomyTagsData.applyMock();

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
  render(<CourseInfoSidebar />, {
    extraWrapper: ({ children }) => (
      <CourseAuthoringProvider courseId={courseId}>
        {children}
      </CourseAuthoringProvider>
    ),
  });

describe('<CourseInfoSidebar />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    mockPermissions();
  });

  it('shows the Manage tags action when user can manage tags', async () => {
    const user = userEvent.setup();
    renderComponent();
    expect(await screen.findByText('Taxonomy Alignments')).toBeInTheDocument();

    const taxonomySection = screen.getByText('Taxonomy Alignments').closest('.pgn__hstack') as HTMLElement;
    const toggle = taxonomySection.querySelector('.dropdown button') as HTMLButtonElement;
    expect(toggle).not.toBeNull();
    await user.click(toggle);

    expect(await screen.findByText('Manage tags')).toBeInTheDocument();
  });

  it('hides the Manage tags action when user cannot manage tags', async () => {
    mockPermissions(false);
    renderComponent();
    expect(await screen.findByText('Taxonomy Alignments')).toBeInTheDocument();

    const taxonomySection = screen.getByText('Taxonomy Alignments').closest('.pgn__hstack') as HTMLElement;
    expect(taxonomySection.querySelector('.dropdown')).toBeNull();
    expect(screen.queryByText('Manage tags')).not.toBeInTheDocument();
  });
});
