import {
  render, screen, fireEvent, waitFor, initializeMocks,
} from '@src/testUtils';
import { UpstreamInfoIcon, UpstreamInfoIconProps } from '.';

type UpstreamInfo = UpstreamInfoIconProps['upstreamInfo'];
const mockOpenSyncModal = jest.fn();

const renderComponent = (upstreamInfo?: UpstreamInfo) => (
  render(
    <UpstreamInfoIcon upstreamInfo={upstreamInfo} openSyncModal={mockOpenSyncModal} />,
  )
);

describe('<UpstreamInfoIcon>', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render with link', () => {
    renderComponent({
      upstreamRef: 'some-ref',
      errorMessage: null,
      readyToSync: false,
    });
    expect(screen.getByTitle('This item is linked to a library item.')).toBeInTheDocument();
    expect(screen.queryByTitle('The referenced library or library object is not available.')).not.toBeInTheDocument();
  });

  it('should render with broken link', () => {
    renderComponent({
      upstreamRef: 'some-ref',
      errorMessage: 'upstream error',
      readyToSync: false,
    });
    expect(screen.getByTitle('This item is linked to a library item.')).toBeInTheDocument();
    expect(screen.getByTitle('The referenced library or library object is not available.')).toBeInTheDocument();
  });

  it('should render with ready to sync link and opens the sync modal', async () => {
    renderComponent({
      upstreamRef: 'some-ref',
      errorMessage: null,
      readyToSync: true,
    });

    const icon = screen.getByTitle('This item is linked to a library item.');
    expect(icon).toBeInTheDocument();
    expect(screen.getByTitle('The linked library or library object has updates available.')).toBeInTheDocument();

    fireEvent.click(icon);
    await waitFor(() => expect(mockOpenSyncModal).toHaveBeenCalled());
  });

  it('should render null without upstream', () => {
    renderComponent(undefined);
    const container = screen.getByTestId('redux-provider');
    expect(container).toBeEmptyDOMElement();
  });

  it('should render null without upstreamRf', () => {
    renderComponent({ upstreamRef: null, errorMessage: null });
    const container = screen.getByTestId('redux-provider');
    expect(container).toBeEmptyDOMElement();
  });
});
