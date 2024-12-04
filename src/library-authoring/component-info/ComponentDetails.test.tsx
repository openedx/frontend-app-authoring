import {
  initializeMocks,
  render as baseRender,
  screen,
} from '../../testUtils';
import {
  mockContentLibrary,
  mockLibraryBlockMetadata,
  mockXBlockAssets,
  mockXBlockOLX,
} from '../data/api.mocks';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
import ComponentDetails from './ComponentDetails';

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockXBlockAssets.applyMock();
mockXBlockOLX.applyMock();

const render = (usageKey: string) => baseRender(<ComponentDetails />, {
  extraWrapper: ({ children }) => (
    <SidebarProvider
      initialSidebarComponentInfo={{
        id: usageKey,
        type: SidebarBodyComponentId.ComponentInfo,
      }}
    >
      {children}
    </SidebarProvider>
  ),
});

describe('<ComponentDetails />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the component details loading', async () => {
    render(mockLibraryBlockMetadata.usageKeyThatNeverLoads);
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should render the component details error', async () => {
    render(mockLibraryBlockMetadata.usageKeyError404);
    expect(await screen.findByText(/Mocked request failed with status code 404/)).toBeInTheDocument();
  });

  it('should render the component usage', async () => {
    render(mockLibraryBlockMetadata.usageKeyNeverPublished);
    expect(await screen.findByText('Component Usage')).toBeInTheDocument();
    // TODO: replace with actual data when implement course list
    expect(screen.queryByText(/This will show the courses that use this component./)).toBeInTheDocument();
  });

  it('should render the component history', async () => {
    render(mockLibraryBlockMetadata.usageKeyNeverPublished);
    // Show created date
    expect(await screen.findByText('June 20, 2024')).toBeInTheDocument();
    // Show modified date
    expect(await screen.findByText('June 21, 2024')).toBeInTheDocument();
  });
});
