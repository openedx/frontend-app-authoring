import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../../../testUtils';
import EditConfirmationButtons from './EditConfirmationButtons';

describe('EditConfirmationButtons', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders two IconButtonWithTooltip buttons', () => {
    render(
      <EditConfirmationButtons updateTitle={jest.fn()} cancelEdit={jest.fn()} />,
    );
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('calls updateTitle when save button is clicked', () => {
    const updateTitleMock = jest.fn();
    render(
      <EditConfirmationButtons updateTitle={updateTitleMock} cancelEdit={jest.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(updateTitleMock).toHaveBeenCalled();
  });

  it('calls cancelEdit when cancel button is clicked', () => {
    const cancelEditMock = jest.fn();
    render(
      <EditConfirmationButtons updateTitle={jest.fn()} cancelEdit={cancelEditMock} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(cancelEditMock).toHaveBeenCalled();
  });
});
