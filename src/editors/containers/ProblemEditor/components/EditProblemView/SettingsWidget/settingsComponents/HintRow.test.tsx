import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import HintRow from './HintRow';

jest.mock('../../../../../../sharedComponents/ExpandableTextArea', () => 'ExpandableTextArea');

describe('HintRow', () => {
  const props = {
    value: 'hint_1',
    handleChange: jest.fn(),
    handleDelete: jest.fn(),
    id: '0',
    images: {},
    isLibrary: false,
    learningContextId: 'course+org+run',
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders hints row', () => {
    render(<HintRow {...props} />);
    expect(screen.getByPlaceholderText('Hint')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete answer' })).toBeInTheDocument();
  });

  test('calls handleDelete when button is clicked', () => {
    render(<HintRow {...props} />);
    expect(screen.getByRole('button', { name: 'Delete answer' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete answer' }));
    expect(props.handleDelete).toHaveBeenCalled();
  });
});
