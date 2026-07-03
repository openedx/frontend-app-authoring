import { setConfig, getConfig } from '@edx/frontend-platform';
import {
  initializeMocks,
  render as testRender,
  screen,
} from '@src/testUtils';

import { LibraryProvider } from '../common/context/LibraryContext';
import {
  mockContentLibrary,
  mockGetCourseImports,
} from '../data/api.mocks';
import { CourseImportHomePage } from './CourseImportHomePage';

mockContentLibrary.applyMock();
mockGetCourseImports.applyMock();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const render = (libraryId: string) => (
  testRender(
    <CourseImportHomePage />,
    {
      extraWrapper: ({ children }: { children: React.ReactNode; }) => (
        <LibraryProvider libraryId={libraryId}>
          {children}
        </LibraryProvider>
      ),
      path: '/libraries/:libraryId/import',
      params: { libraryId },
    },
  )
);

describe('<CourseImportHomePage>', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the library course import home page', async () => {
    render(mockGetCourseImports.libraryId);
    expect(await screen.findByRole('heading', { name: /Tools.*Import/ })).toBeInTheDocument(); // Header
    expect(screen.getByRole('heading', { name: 'Previous Imports' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /DemoX 2025 T[0-5]/ })).toHaveLength(4);
  });

  it('should render the empty state', async () => {
    render(mockGetCourseImports.emptyLibraryId);
    expect(await screen.findByRole('heading', { name: /Tools.*Import/ })).toBeInTheDocument(); // Header
    expect(screen.queryByRole('heading', { name: 'Previous Imports' })).not.toBeInTheDocument();
    expect(screen.getByText('You have not imported any courses into this library.')).toBeInTheDocument();
  });

  it('should show the import course button when flag is the string "true"', async () => {
    setConfig({ ...getConfig(), ENABLE_COURSE_IMPORT_IN_LIBRARY: 'true' });
    render(mockGetCourseImports.emptyLibraryId);
    // Button appears in both the SubHeader and the EmptyState call-to-action
    expect(await screen.findAllByRole('button', { name: /import course/i })).toHaveLength(2);
  });

  it('should show the import course button when flag is the boolean true (MFE Config API)', async () => {
    setConfig({ ...getConfig(), ENABLE_COURSE_IMPORT_IN_LIBRARY: true });
    render(mockGetCourseImports.emptyLibraryId);
    // Button appears in both the SubHeader and the EmptyState call-to-action
    expect(await screen.findAllByRole('button', { name: /import course/i })).toHaveLength(2);
  });

  it('should not show the import course button when flag is disabled', async () => {
    setConfig({ ...getConfig(), ENABLE_COURSE_IMPORT_IN_LIBRARY: 'false' });
    render(mockGetCourseImports.emptyLibraryId);
    await screen.findByText('You have not imported any courses into this library.');
    expect(screen.queryAllByRole('button', { name: /import course/i })).toHaveLength(0);
  });
});
