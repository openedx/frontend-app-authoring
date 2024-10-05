import {
  initializeMocks,
  render,
  screen,
} from '../../testUtils';
import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import { LibraryProvider } from '../common/context';
import ComponentDetails from './ComponentDetails';

mockContentLibrary.applyMock();

const withLibraryId = (libraryId: string = mockContentLibrary.libraryId) => ({
  extraWrapper: ({ children }: { children: React.ReactNode }) => (
    <LibraryProvider libraryId={libraryId}>{children}</LibraryProvider>
  ),
});

describe('<ComponentDetails />', () => {
  it('should render the component details loading', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyThatNeverLoads} />, withLibraryId());
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should render the component details error', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyError404} />, withLibraryId());
    expect(await screen.findByText(/Mocked request failed with status code 404/)).toBeInTheDocument();
  });

  it('should render the component usage', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />, withLibraryId());
    expect(await screen.findByText('Component Usage')).toBeInTheDocument();
    // TODO: replace with actual data when implement tag list
    expect(screen.queryByText('This will show the courses that use this component.')).toBeInTheDocument();
  });

  it('should render the component history', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />, withLibraryId());
    // Show created date
    expect(await screen.findByText('June 20, 2024')).toBeInTheDocument();
    // Show modified date
    expect(await screen.findByText('June 21, 2024')).toBeInTheDocument();
  });
});
