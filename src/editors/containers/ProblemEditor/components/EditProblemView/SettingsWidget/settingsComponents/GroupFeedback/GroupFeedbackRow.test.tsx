import React from 'react';
import {
  render,
  screen,
  initializeMocks,
  fireEvent,
} from '@src/testUtils';
import GroupFeedbackRow from './GroupFeedbackRow';

describe('GroupFeedbackRow', () => {
  const answers = [
    { id: '1', text: 'Answer 1', isCorrect: false },
    { id: '2', text: 'Answer 2', isCorrect: true },
    { id: '3', text: 'Answer 3', isCorrect: false },
    { id: '4', text: 'Answer 4', isCorrect: false },
  ];
  const props = {
    value: { id: 1, answers: answers.map(a => a.id), feedback: 'sOmE FeEDBACK' },
    answers,
    handleAnswersSelectedChange: jest.fn(),
    handleFeedbackChange: jest.fn(),
    handleDelete: jest.fn(),
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders component and anwers', () => {
    render(<GroupFeedbackRow {...props} />);
    expect(screen.getByRole('button', { name: 'Delete answer' })).toBeInTheDocument();
    const options = screen.getAllByRole('checkbox');
    expect(options).toHaveLength(answers.length);
  });

  test('handles delete answear correctly', () => {
    const mockDelete = jest.fn();
    render(<GroupFeedbackRow {...props} handleDelete={mockDelete} />);
    const button = screen.getByRole('button', { name: 'Delete answer' });
    fireEvent.click(button);
    expect(mockDelete).toHaveBeenCalled();
  });

  test('handles selected answer change correctly', () => {
    const handleAnswersSelectedChangeMock = jest.fn();
    render(<GroupFeedbackRow {...props} handleAnswersSelectedChange={handleAnswersSelectedChangeMock} />);
    const checkbox2 = screen.getByRole('checkbox', { name: '2' });
    fireEvent.click(checkbox2);
    expect(handleAnswersSelectedChangeMock).toHaveBeenCalled();
  });

  test('handles feedback change correctly', () => {
    const handleFeedbackChangeMock = jest.fn();
    render(<GroupFeedbackRow {...props} handleFeedbackChange={handleFeedbackChangeMock} />);
    const feedbackInput = screen.getByRole('textbox');
    fireEvent.change(feedbackInput, { target: { value: 'New feedback' } });
    expect(handleFeedbackChangeMock).toHaveBeenCalled();
  });
});
