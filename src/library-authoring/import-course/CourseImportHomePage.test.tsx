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
      extraWrapper: ({ children }: { children: React.ReactNode }) => (
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
});
