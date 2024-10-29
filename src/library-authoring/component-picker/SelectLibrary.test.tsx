import {
  initializeMocks,
  fireEvent,
  render,
  screen,
} from '../../testUtils';
import {
  mockGetContentLibraryV2List,
} from '../data/api.mocks';
import { ComponentPicker } from './ComponentPicker';

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

  it('should render the no library status', async () => {
    mockGetContentLibraryV2List.applyMockEmpty();
    render(<ComponentPicker />);

    expect(await screen.findByText(/you don't have any libraries created yet,/i)).toBeInTheDocument();
  });

  it('should render the no search result status', async () => {
    mockGetContentLibraryV2List.applyMockEmpty();
    render(<ComponentPicker />);

    const searchField = await screen.findByPlaceholderText('Search for a library');
    fireEvent.change(searchField, { target: { value: 'test' } });
    fireEvent.submit(searchField);

    expect(await screen.findByText(/there are no libraries with the current filters/i)).toBeInTheDocument();
  });

  it('should render the error status', async () => {
    mockGetContentLibraryV2List.applyMockError();
    render(<ComponentPicker />);

    expect(await screen.findByText(/mocked request failed with status code 500/i)).toBeInTheDocument();
  });
});
