import {
  initializeMocks,
  render,
  screen,
} from '../../testUtils';
import {
  mockGetContentLibraryV2List,
} from '../data/api.mocks';
import { ComponentPicker } from './ComponentPicker';

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
    mockGetContentLibraryV2List.applyMock();
    render(<ComponentPicker />);

    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
    expect(await screen.findByText('Test Library 1')).toBeInTheDocument();
  });

  it('should render the loading status', async () => {
    mockGetContentLibraryV2List.applyMockLoading();
    render(<ComponentPicker />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('should render the error status', async () => {
    mockGetContentLibraryV2List.applyMockError();
    render(<ComponentPicker />);

    expect(await screen.findByText(/mocked request failed with status code 500/i)).toBeInTheDocument();
  });
});
