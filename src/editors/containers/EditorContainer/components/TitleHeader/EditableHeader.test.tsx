import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import EditableHeader from './EditableHeader';

describe('EditableHeader', () => {
  const props = {
    handleChange: jest.fn().mockName('args.handleChange'),
    updateTitle: jest.fn().mockName('args.updateTitle'),
    handleKeyDown: jest.fn().mockName('args.handleKeyDown'),
    inputRef: jest.fn().mockName('args.inputRef'),
    localTitle: 'test-title-text',
    cancelEdit: jest.fn().mockName('args.cancelEdit'),
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders input with correct value and placeholder', () => {
    render(<EditableHeader {...props} />);
    const input = screen.getByPlaceholderText('Title');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe(props.localTitle);
  });

  test('calls handleChange when input changes', () => {
    render(<EditableHeader {...props} />);
    const input = screen.getByPlaceholderText('Title');
    fireEvent.change(input, { target: { value: 'New title' } });
    expect(props.handleChange).toHaveBeenCalled();
  });

  test('calls handleKeyDown on keydown', () => {
    render(<EditableHeader {...props} />);
    const input = screen.getByPlaceholderText('Title');
    fireEvent.keyDown(input, { target: { value: 'New title' } });
    expect(props.handleKeyDown).toHaveBeenCalled();
  });

  test('calls updateTitle on blur', () => {
    render(<EditableHeader {...props} />);
    const input = screen.getByPlaceholderText('Title');
    fireEvent.blur(input);
    expect(props.updateTitle).toHaveBeenCalled();
  });

  test('calls inputRef if provided', () => {
    const inputRef = jest.fn();
    render(<EditableHeader {...props} inputRef={inputRef} />);
    expect(inputRef).toHaveBeenCalled();
  });

  test('renders buttons from trailing element EditConfirmationButtons', () => {
    render(<EditableHeader {...props} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });
});
