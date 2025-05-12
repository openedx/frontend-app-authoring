import { getConfig } from '@edx/frontend-platform';
import {
  initializeMocks,
  render as baseRender,
  screen,
  fireEvent,
} from '../../testUtils';
import { mockFetchIndexDocuments, mockContentSearchConfig } from '../../search-manager/data/api.mock';
import {
  mockContentLibrary,
  mockGetEntityLinks,
  mockLibraryBlockMetadata,
  mockXBlockAssets,
  mockXBlockOLX,
} from '../data/api.mocks';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
import ComponentDetails from './ComponentDetails';

mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockXBlockAssets.applyMock();
mockXBlockOLX.applyMock();
mockGetEntityLinks.applyMock();
mockFetchIndexDocuments.applyMock();

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
    render(mockLibraryBlockMetadata.usageKeyPublished);
    expect(await screen.findByText('Component Usage')).toBeInTheDocument();
    const course1 = await screen.findByText('Course 1');
    expect(course1).toBeInTheDocument();
    fireEvent.click(screen.getByText('Course 1'));

    const course2 = screen.getByText('Course 2');
    expect(course2).toBeInTheDocument();
    fireEvent.click(screen.getByText('Course 2'));

    const links = screen.getAllByRole('link');
    // There are 2 instances in the Unit 1, but only one is shown
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent('Unit 1');
    expect(links[0]).toHaveAttribute(
      'href',
      `${getConfig().STUDIO_BASE_URL}/container/block-v1:org+course1+run+type@vertical+block@verticalId1`,
    );
    expect(links[1]).toHaveTextContent('Unit 2');
    expect(links[1]).toHaveAttribute(
      'href',
      `${getConfig().STUDIO_BASE_URL}/container/block-v1:org+course1+run+type@vertical+block@verticalId2`,
    );
    expect(links[2]).toHaveTextContent('Problem Bank 3');
    expect(links[2]).toHaveAttribute(
      'href',
      `${getConfig().STUDIO_BASE_URL}/container/block-v1:org+course2+run+type@itembank+block@itembankId3`,
    );
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
