import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import TranscriptColumn from './TranscriptColumn';

const rowWith = (transcripts: string[], transcriptionStatus = '') => ({
  original: { transcripts, transcriptionStatus },
});

describe('TranscriptColumn', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('pluralizes the transcript count', () => {
    const { rerender } = render(<TranscriptColumn row={rowWith(['en'])} />);
    expect(screen.getByText('1 transcript available')).toBeInTheDocument();

    rerender(<TranscriptColumn row={rowWith(['en', 'es', 'fr'])} />);
    expect(screen.getByText('3 transcripts available')).toBeInTheDocument();

    rerender(<TranscriptColumn row={rowWith([])} />);
    expect(screen.getByText('No transcripts available')).toBeInTheDocument();
  });

  it('renders plain text when no handler is provided', () => {
    render(<TranscriptColumn row={rowWith(['en'])} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens the file info from the count link, including when there are no transcripts yet', () => {
    const handleOpenFileInfo = jest.fn();
    const row = rowWith([]);
    render(<TranscriptColumn row={row} handleOpenFileInfo={handleOpenFileInfo} />);

    fireEvent.click(screen.getByRole('button', { name: 'No transcripts available' }));
    expect(handleOpenFileInfo).toHaveBeenCalledWith(row.original);
  });
});
