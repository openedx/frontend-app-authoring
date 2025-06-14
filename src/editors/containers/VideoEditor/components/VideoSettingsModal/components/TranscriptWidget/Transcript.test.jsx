import React from 'react';
import {
  render, fireEvent, screen, initializeMocks,
} from 'CourseAuthoring/testUtils';
import { TranscriptInternal, hooks } from './Transcript';

jest.mock('./TranscriptActionMenu', () => jest.fn(() => <div>TranscriptActionMenu</div>));
jest.mock('./LanguageSelector', () => jest.fn(() => <div>LanguageSelector</div>));

const defaultProps = {
  index: 0,
  language: '',
  transcriptUrl: undefined,
  deleteTranscript: jest.fn(),
};

describe('TranscriptInternal', () => {
  const cancelDelete = jest.fn();
  const deleteTranscript = jest.fn();
  jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
    inDeleteConfirmation: false,
    launchDeleteConfirmation: deleteTranscript,
    cancelDelete,
  });

  beforeEach(() => {
    initializeMocks();
  });

  it('renders ActionRow and LanguageSelector when not in delete confirmation', () => {
    render(<TranscriptInternal {...defaultProps} />);
    expect(screen.getByText('LanguageSelector')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders TranscriptActionMenu when language is not empty', () => {
    const props = { language: 'en', transcriptUrl: 'url' };
    render(<TranscriptInternal {...defaultProps} {...props} />);
    expect(screen.getByText('TranscriptActionMenu')).toBeInTheDocument();
  });

  it('calls launchDeleteConfirmation when IconButton is clicked', () => {
    render(<TranscriptInternal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(deleteTranscript).toHaveBeenCalled();
  });

  it('renders delete confirmation card when inDeleteConfirmation is true', () => {
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: true,
      launchDeleteConfirmation: jest.fn(),
      cancelDelete,
    });
    render(<TranscriptInternal {...defaultProps} />);
    expect(screen.getByText('Delete this transcript?')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this transcript?')).toBeInTheDocument();
  });

  it('calls cancelDelete when cancel button is clicked', () => {
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: true,
      launchDeleteConfirmation: jest.fn(),
      cancelDelete,
    });
    render(<TranscriptInternal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(cancelDelete).toHaveBeenCalled();
  });

  it('calls deleteTranscript and cancelDelete when confirm delete is clicked', () => {
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: true,
      launchDeleteConfirmation: jest.fn(),
      cancelDelete,
    });
    const props = { language: 'es', deleteTranscript };
    render(<TranscriptInternal {...defaultProps} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(deleteTranscript).toHaveBeenCalledWith({ language: 'es' });
    expect(cancelDelete).toHaveBeenCalled();
  });
});
