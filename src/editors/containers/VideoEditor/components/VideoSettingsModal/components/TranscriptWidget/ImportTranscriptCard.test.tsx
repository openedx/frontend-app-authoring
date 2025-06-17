import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '@src/testUtils';
import { ImportTranscriptCardInternal as ImportTranscriptCard } from './ImportTranscriptCard';

jest.mock('../../../../../../data/redux', () => ({
  thunkActions: {
    video: {
      importTranscript: jest.fn().mockName('thunkActions.video.importTranscript'),
    },
  },
}));

describe('ImportTranscriptCard (RTL)', () => {
  const mockSetOpen = jest.fn();
  const mockImportTranscript = jest.fn();

  beforeEach(() => {
    initializeMocks();
  });

  it('renders header, message, and button', () => {
    render(
      <ImportTranscriptCard setOpen={mockSetOpen} importTranscript={mockImportTranscript} />,
    );
    expect(screen.getByText('Import transcript from YouTube?')).toBeInTheDocument();
    expect(screen.getByText('We found transcript for this video on YouTube. Would you like to import it now?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import Transcript' })).toBeInTheDocument();
  });

  it('calls setOpen(false) when close IconButton is clicked', () => {
    const { container } = render(
      <ImportTranscriptCard setOpen={mockSetOpen} importTranscript={mockImportTranscript} />,
    );
    const closeButton = container.querySelector('.btn-icon-primary');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it('calls importTranscript when import button is clicked', () => {
    render(
      <ImportTranscriptCard setOpen={mockSetOpen} importTranscript={mockImportTranscript} />,
    );
    const importBtn = screen.getByRole('button', { name: 'Import Transcript' });
    fireEvent.click(importBtn);
    expect(mockImportTranscript).toHaveBeenCalled();
  });
});
