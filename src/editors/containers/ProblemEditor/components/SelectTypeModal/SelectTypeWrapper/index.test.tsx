import React from 'react';
import {
  screen, fireEvent, initializeMocks,
} from '../../../../../../testUtils';
import render from '../../../../../testRender';
import SelectTypeWrapper from './index';
import * as hooks from '../hooks';

jest.mock('@openedx/paragon/icons', () => ({
  Close: 'CloseIcon',
}));

describe('SelectTypeWrapper', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    initializeMocks();
  });

  it('renders component with provided content', () => {
    render(
      <SelectTypeWrapper selected="foo" onClose={mockOnClose}>
        <div>Child Content</div>
      </SelectTypeWrapper>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <SelectTypeWrapper selected="foo" onClose={mockOnClose}>
        <div />
      </SelectTypeWrapper>,
    );
    fireEvent.click(screen.getByLabelText('Exit the editor'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <SelectTypeWrapper selected="foo" onClose={mockOnClose}>
        <div />
      </SelectTypeWrapper>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls hooks.onSelect with correct args when select button is clicked', () => {
    const onSelectMock = jest.fn();
    jest.spyOn(hooks, 'onSelect').mockImplementation(onSelectMock);

    render(
      <SelectTypeWrapper selected="foo" onClose={mockOnClose}>
        <div />
      </SelectTypeWrapper>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select' }));
    expect(hooks.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        selected: 'foo',
        updateField: expect.any(Function),
        setBlockTitle: expect.any(Function),
        defaultSettings: expect.any(Object),
      }),
    );
    expect(onSelectMock).toHaveBeenCalled();
  });

  it('disables select button when selected is empty', () => {
    render(
      <SelectTypeWrapper selected="" onClose={mockOnClose}>
        <div />
      </SelectTypeWrapper>,
    );
    const selectBtn = screen.getByRole('button', { name: 'Select' });
    expect(selectBtn).toBeDisabled();
  });

  it('enables select button when selected is not empty', () => {
    render(
      <SelectTypeWrapper selected="bar" onClose={mockOnClose}>
        <div />
      </SelectTypeWrapper>,
    );
    const selectBtn = screen.getByRole('button', { name: 'Select' });
    expect(selectBtn).not.toBeDisabled();
  });
});
