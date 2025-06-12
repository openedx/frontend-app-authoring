import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../../../../../testUtils';
import TypeRow from './TypeRow';

const mockOnClick = jest.fn();
jest.mock('../hooks', () => ({
  typeRowHooks: () => ({ onClick: mockOnClick }),
}));

const defaultProps = {
  answers: [
    {
      correct: true, id: '1', selectedFeedback: 'Good', title: 'A', unselectedFeedback: 'Try again',
    },
    {
      correct: false, id: '2', selectedFeedback: 'No', title: 'B', unselectedFeedback: 'Nope',
    },
  ],
  blockTitle: 'Block Title',
  correctAnswerCount: 1,
  typeKey: 'multiple_choice',
  label: 'Multiple Choice',
  selected: false,
  lastRow: false,
  problemType: 'choice',
  setBlockTitle: jest.fn(),
  updateField: jest.fn(),
  updateAnswer: jest.fn(),
};

describe('TypeRow Component', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders label and Check icon when not selected', () => {
    const { container } = render(<TypeRow {...defaultProps} />);
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon?.parentElement).toHaveClass('text-success');
  });

  test('calls onClick from typeRowHooks when Button is clicked', () => {
    render(<TypeRow {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
  });

  test('renders with minimal valid props', () => {
    const minimalProps = {
      ...defaultProps,
      answers: [],
      blockTitle: '',
      correctAnswerCount: 0,
      typeKey: 'short_answer',
      label: 'Short Answer',
      selected: false,
      lastRow: false,
      problemType: 'short',
    };
    render(<TypeRow {...minimalProps} />);
    expect(screen.getByText('Short Answer')).toBeInTheDocument();
  });
});
