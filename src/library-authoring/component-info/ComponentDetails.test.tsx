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
  mockComponentDownstreamContexts,
} from '../data/api.mocks';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
import ComponentDetails from './ComponentDetails';

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockXBlockAssets.applyMock();
mockXBlockOLX.applyMock();
mockComponentDownstreamContexts.applyMock();

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
    render(mockComponentDownstreamContexts.usageKey);
    expect(await screen.findByText('Component Usage')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent('Course 1');
    expect(links[0]).toHaveAttribute('href', '/course/course-v1:org+course+run');
    expect(links[1]).toHaveTextContent('Course 2');
    expect(links[1]).toHaveAttribute('href', '/course/course-v1:org+course2+run');
  });

  it('should render the component history', async () => {
    render(mockLibraryBlockMetadata.usageKeyPublished);
    // Show created date
    expect(await screen.findByText('June 20, 2024')).toBeInTheDocument();
    // Show modified date
    expect(await screen.findByText('June 21, 2024')).toBeInTheDocument();
    // Show last published date
    expect(await screen.findByText('June 22, 2024')).toBeInTheDocument();
  });
});
