import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '@src/testUtils';
import * as ReactRedux from 'react-redux';
import { ImportTranscriptCard } from './ImportTranscriptCard';

const mockDispatch = jest.fn();

describe('ImportTranscriptCard (RTL)', () => {
  const mockSetOpen = jest.fn();

  beforeEach(() => {
    jest.spyOn(ReactRedux, 'useDispatch').mockReturnValue(mockDispatch);
    initializeMocks();
  });

  it('renders header, message, and button', () => {
    render(
      <ImportTranscriptCard setOpen={mockSetOpen} />,
    );
    expect(screen.getByText('Import transcript from YouTube?')).toBeInTheDocument();
    expect(screen.getByText('We found transcript for this video on YouTube. Would you like to import it now?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import Transcript' })).toBeInTheDocument();
  });

  it('calls setOpen(false) when close IconButton is clicked', () => {
    const { container } = render(
      <ImportTranscriptCard setOpen={mockSetOpen} />,
    );
    const closeButton = container.querySelector('.btn-icon-primary');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it('calls importTranscript when import button is clicked', () => {
    render(
      <ImportTranscriptCard setOpen={mockSetOpen} />,
    );
    const importBtn = screen.getByRole('button', { name: 'Import Transcript' });
    fireEvent.click(importBtn);
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // dispatched thunk
  });
});
