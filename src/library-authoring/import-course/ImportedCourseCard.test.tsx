import userEvent from '@testing-library/user-event';

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
import { type CourseImport } from '../data/api';
import { ImportedCourseCard } from './ImportedCourseCard';

mockContentLibrary.applyMock();
const { libraryId } = mockContentLibrary;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const render = (courseImport: CourseImport) => (
  testRender(
    <ImportedCourseCard courseImport={courseImport} />,
    {
      extraWrapper: ({ children }: { children: React.ReactNode }) => (
        <LibraryProvider libraryId={mockContentLibrary.libraryId}>
          {children}
        </LibraryProvider>
      ),
      path: '/libraries/:libraryId/import-course',
      params: { libraryId },
    },
  )
);

describe('<ImportedCourseCard>', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render a card for a successful import', () => {
    const { succeedImport } = mockGetCourseImports;
    render(succeedImport);
    expect(screen.getByText(succeedImport.source.displayName)).toBeInTheDocument();
    expect(screen.getByText(/100% Imported/)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: succeedImport.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${succeedImport.source.key}`);
  });

  it('should render a card for a successful import with a collection', async () => {
    const { succeedImportWithCollection } = mockGetCourseImports;
    render(succeedImportWithCollection);
    expect(screen.getByText(succeedImportWithCollection.source.displayName)).toBeInTheDocument();
    expect(screen.getByText(/100% Imported/)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: succeedImportWithCollection.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${succeedImportWithCollection.source.key}`);

    const collectionLink = await screen.findByText(succeedImportWithCollection.targetCollection.title);
    await userEvent.click(collectionLink);
    expect(mockNavigate).toHaveBeenCalledWith(
      {
        pathname: `/library/${libraryId}/collection/${succeedImportWithCollection.targetCollection.key}`,
        search: '',
      },
    );
  });

  it('should render a card for a failed import', () => {
    const { failImport } = mockGetCourseImports;
    render(failImport);
    expect(screen.getByText(failImport.source.displayName)).toBeInTheDocument();
    expect(screen.getByText('Import Failed')).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: failImport.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${failImport.source.key}`);
  });

  it('should render a card for an in-progress import', () => {
    const { inProgressImport } = mockGetCourseImports;
    render(inProgressImport);
    expect(screen.getByText(inProgressImport.source.displayName)).toBeInTheDocument();
    expect(screen.getByText(/50% Imported/)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: inProgressImport.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${inProgressImport.source.key}`);
  });
});
