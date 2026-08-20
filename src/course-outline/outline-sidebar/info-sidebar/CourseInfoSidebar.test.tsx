import { fireEvent, initializeMocks, render, screen } from '@src/testUtils';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockContentTaxonomyTagsData } from '@src/content-tags-drawer/data/api.mocks';
import { CourseInfoSidebar } from './CourseInfoSidebar';

const courseId = mockContentTaxonomyTagsData.otherTagsId;

jest.mock('@src/authz/hooks', () => ({
  ...jest.requireActual('@src/authz/hooks'),
  useCourseUserPermissions: jest.fn(),
}));

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
    initializeMocks();
    jest.mocked(useCourseUserPermissions).mockReturnValue({
      canManageTags: true,
      isLoading: false,
      isAuthzEnabled: false,
    } as ReturnType<typeof useCourseUserPermissions>);
  });

  it('shows the Manage tags action when user can manage tags', async () => {
    renderComponent();
    expect(await screen.findByText('Taxonomy Alignments')).toBeInTheDocument();

    const taxonomySection = screen.getByText('Taxonomy Alignments').closest('.pgn__hstack') as HTMLElement;
    const toggle = taxonomySection.querySelector('.dropdown button') as HTMLButtonElement;
    expect(toggle).not.toBeNull();
    fireEvent.click(toggle);

    expect(await screen.findByText('Manage tags')).toBeInTheDocument();
  });

  it('hides the Manage tags action when user cannot manage tags', async () => {
    jest.mocked(useCourseUserPermissions).mockReturnValue({
      canManageTags: false,
      isLoading: false,
      isAuthzEnabled: false,
    } as ReturnType<typeof useCourseUserPermissions>);
    renderComponent();
    expect(await screen.findByText('Taxonomy Alignments')).toBeInTheDocument();

    const taxonomySection = screen.getByText('Taxonomy Alignments').closest('.pgn__hstack') as HTMLElement;
    expect(taxonomySection.querySelector('.dropdown')).toBeNull();
    expect(screen.queryByText('Manage tags')).not.toBeInTheDocument();
  });
});
