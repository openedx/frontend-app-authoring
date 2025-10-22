import userEvent from '@testing-library/user-event';

import {
  initializeMocks,
  render as testRender,
  screen,
  waitFor,
} from '@src/testUtils';

import { LibraryProvider } from '../common/context/LibraryContext';
import {
  mockContentLibrary,
  mockGetCourseMigrations,
} from '../data/api.mocks';
import { type CourseMigration } from '../data/api';
import { MigratedCourseCard } from './MigratedCourseCard';

initializeMocks();
mockContentLibrary.applyMock();
const { libraryId } = mockContentLibrary;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const render = (courseMigration: CourseMigration) => (
  testRender(
    <MigratedCourseCard courseMigration={courseMigration} />,
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

describe('<MigratedCourseCard>', () => {
  it('should render a card for a successful migration', () => {
    const { succeedMigration } = mockGetCourseMigrations;
    render(succeedMigration);
    expect(screen.getByText(succeedMigration.source.displayName)).toBeInTheDocument();
    expect(screen.getByText(/100% Imported/)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: succeedMigration.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${succeedMigration.source.key}`);
  });

  it('should render a card for a successful migration with a collection', async () => {
    const { succeedMigrationWithCollection } = mockGetCourseMigrations;
    render(succeedMigrationWithCollection);
    expect(screen.getByText(succeedMigrationWithCollection.source.displayName)).toBeInTheDocument();
    expect(screen.getByText(/100% Imported/)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: succeedMigrationWithCollection.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${succeedMigrationWithCollection.source.key}`);

    const collectionLink = await screen.findByText(succeedMigrationWithCollection.targetCollection.title);
    userEvent.click(collectionLink);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        {
          pathname: `/library/${libraryId}/collection/${succeedMigrationWithCollection.targetCollection.key}`,
          search: '',
        },
      );
    });
  });

  it('should render a card for a failed migration', () => {
    const { failMigration } = mockGetCourseMigrations;
    render(failMigration);
    expect(screen.getByText(failMigration.source.displayName)).toBeInTheDocument();
    expect(screen.getByText('Import Failed')).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: failMigration.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${failMigration.source.key}`);
  });

  it('should render a card for an in-progress migration', () => {
    const { inProgressMigration } = mockGetCourseMigrations;
    render(inProgressMigration);
    expect(screen.getByText(inProgressMigration.source.displayName)).toBeInTheDocument();
    expect(screen.getByText(/50% Imported/)).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: inProgressMigration.source.displayName });
    expect(courseLink).toHaveAttribute('href', `/course/${inProgressMigration.source.key}`);
  });
});
