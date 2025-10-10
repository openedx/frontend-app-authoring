import React from 'react';
import {
  render, fireEvent, screen, initializeMocks,
} from 'CourseAuthoring/testUtils';
import { useDispatch } from 'react-redux';
import { thunkActions } from '@src/editors/data/redux';
import Transcript, { hooks } from './Transcript';

// Mock child components
jest.mock('./TranscriptActionMenu', () => jest.fn(() => <div>TranscriptActionMenu</div>));
jest.mock('./LanguageSelector', () => jest.fn(() => <div>LanguageSelector</div>));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
jest.mock('@src/editors/data/redux', () => ({
  thunkActions: {
    video: {
      deleteTranscript: jest.fn(),
    },
  },
}));

const defaultProps = {
  index: 0,
  language: '',
  transcriptUrl: undefined,
};

describe('Transcript', () => {
  const cancelDelete = jest.fn();
  const mockDispatch = jest.fn();

  beforeEach(() => {
    initializeMocks();
    useDispatch.mockReturnValue(mockDispatch);

    // Default hook mock
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: false,
      launchDeleteConfirmation: jest.fn(),
      cancelDelete,
    });
  });

  it('renders ActionRow and LanguageSelector when not in delete confirmation', () => {
    render(<Transcript {...defaultProps} />);
    expect(screen.getByText('LanguageSelector')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders TranscriptActionMenu when language is not empty', () => {
    render(<Transcript {...defaultProps} language="en" transcriptUrl="url" />);
    expect(screen.getByText('TranscriptActionMenu')).toBeInTheDocument();
  });

  it('calls launchDeleteConfirmation when IconButton is clicked', () => {
    const launchDeleteConfirmation = jest.fn();
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: false,
      launchDeleteConfirmation,
      cancelDelete,
    });
    render(<Transcript {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(launchDeleteConfirmation).toHaveBeenCalled();
  });

  it('renders delete confirmation card when inDeleteConfirmation is true', () => {
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: true,
      launchDeleteConfirmation: jest.fn(),
      cancelDelete,
    });
    render(<Transcript {...defaultProps} />);
    expect(screen.getByText('Delete this transcript?')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this transcript?'),
    ).toBeInTheDocument();
  });

  it('calls cancelDelete when cancel button is clicked', () => {
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: true,
      launchDeleteConfirmation: jest.fn(),
      cancelDelete,
    });
    render(<Transcript {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(cancelDelete).toHaveBeenCalled();
  });

  it('dispatches deleteTranscript thunk and calls cancelDelete when confirm delete is clicked', () => {
    jest.spyOn(hooks, 'setUpDeleteConfirmation').mockReturnValue({
      inDeleteConfirmation: true,
      launchDeleteConfirmation: jest.fn(),
      cancelDelete,
    });

    thunkActions.video.deleteTranscript.mockReturnValue('mockThunk');

    render(<Transcript {...defaultProps} language="es" />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(thunkActions.video.deleteTranscript).toHaveBeenCalledWith({ language: 'es' });
    expect(mockDispatch).toHaveBeenCalledWith('mockThunk');
    expect(cancelDelete).toHaveBeenCalled();
  });
});
