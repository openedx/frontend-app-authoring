import {
  initializeMocks,
  render,
  screen,
} from '../../testUtils';
import { mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentDetails from './ComponentDetails';

describe('<ComponentDetails />', () => {
  it('should render the component details loading', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyThatNeverLoads} />);
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should render the component details error', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyError404} />);
    expect(await screen.findByText(/Mocked request failed with status code 404/)).toBeInTheDocument();
  });

  it('should render the component usage', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />);
    expect(await screen.findByText('Component Usage')).toBeInTheDocument();
    // TODO: replace with actual data when implement tag list
    expect(screen.queryByText('This will show the courses that use this component.')).toBeInTheDocument();
  });

  it('should render the component history', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentDetails usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />);
    // Show created date
    expect(await screen.findByText('June 20, 2024')).toBeInTheDocument();
    // Show modified date
    expect(await screen.findByText('June 21, 2024')).toBeInTheDocument();
  });
});
