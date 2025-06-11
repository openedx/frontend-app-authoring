import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../../../testUtils';
import EditConfirmationButtons from './EditConfirmationButtons';

jest.mock('@openedx/paragon/icons', () => ({
  Check: 'CheckIcon',
  Close: 'CloseIcon',
}));

describe('EditConfirmationButtons', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders two IconButtonWithTooltip buttons', () => {
    render(
      <EditConfirmationButtons updateTitle={jest.fn()} cancelEdit={jest.fn()} />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toContainHTML('checkicon');
    expect(buttons[1]).toContainHTML('closeicon');
  });

  it('calls updateTitle when save button is clicked', () => {
    const updateTitleMock = jest.fn();
    render(
      <EditConfirmationButtons updateTitle={updateTitleMock} cancelEdit={jest.fn()} />,
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(updateTitleMock).toHaveBeenCalled();
  });

  it('calls cancelEdit when cancel button is clicked', () => {
    const cancelEditMock = jest.fn();
    render(
      <EditConfirmationButtons updateTitle={jest.fn()} cancelEdit={cancelEditMock} />,
    );
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(cancelEditMock).toHaveBeenCalled();
  });
});
