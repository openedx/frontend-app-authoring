import {
  initializeMocks,
  fireEvent,
  render,
  screen,
} from '../../testUtils';
import {
  mockGetContentLibraryV2List,
  mockContentLibrary,
  mockLibraryBlockMetadata,
} from '../data/api.mocks';
import { ComponentPicker } from './ComponentPicker';

mockGetContentLibraryV2List.applyMock();
mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => {
    const [params] = [new URLSearchParams({
      parentLocator: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
    })];
    return [
      params,
    ];
  },
}));

describe('<ComponentPicker />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the library list', async () => {
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue(/lib:sampletaxonomyorg1:tl1/i));

    fireEvent.click(screen.getByText('Next'));

    // Wait for the content library to load
    expect(await screen.findByText('Content library')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
  });
});
