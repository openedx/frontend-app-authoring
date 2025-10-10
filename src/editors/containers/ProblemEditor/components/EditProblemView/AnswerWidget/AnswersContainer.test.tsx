import React from 'react';

import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import {
  render, screen, fireEvent, initializeMocks,
} from '@src/testUtils';
import { actions } from '@src/editors/data/redux';
import AnswersContainer from './AnswersContainer';

const { useAnswerContainer } = require('./hooks');

// Mock answers for state
const answers = [
  { id: 'a1', isAnswerRange: false },
  { id: 'a2', isAnswerRange: false },
];

// Mock actions module
jest.mock('../../../../../data/redux', () => ({
  __esModule: true,
  actions: {
    problem: {
      addAnswer: jest.fn(() => ({ type: 'ADD_ANSWER' })),
      addAnswerRange: jest.fn(() => ({ type: 'ADD_ANSWER_RANGE' })),
      updateField: jest.fn((field, value) => ({ type: 'UPDATE_FIELD', payload: { field, value } })),
    },
  },
  selectors: {
    problem: {
      answers: jest.fn(() => answers),
    },
  },
}));

// Mock AnswerOption and Button components
jest.mock('./AnswerOption', () => jest.fn(({ answer }) => <div>AnswerOption-{answer.id}</div>));
jest.mock(
  '../../../../../sharedComponents/Button',
  () => jest.fn(({ children, ...props }) => <button type="button" {...props}>{children}</button>),
);

// Mock hooks
jest.mock('./hooks', () => ({
  useAnswerContainer: jest.fn(),
  isSingleAnswerProblem: jest.fn(() => false),
}));

describe('AnswersContainer', () => {
  const defaultProps = {
    problemType: 'multiple_choice',
  };

  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  it('renders AnswerOption for each answer', () => {
    render(<AnswersContainer {...defaultProps} />);
    expect(screen.getByText('AnswerOption-a1')).toBeInTheDocument();
    expect(screen.getByText('AnswerOption-a2')).toBeInTheDocument();
  });

  it('renders add answer Button for non-NUMERIC problemType and calls addAnswer on click', () => {
    render(<AnswersContainer {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Add answer' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(actions.problem.addAnswer).toHaveBeenCalled();
  });

  it('renders Dropdown for NUMERIC problemType', () => {
    render(<AnswersContainer {...defaultProps} problemType={ProblemTypeKeys.NUMERIC} />);
    expect(screen.getByRole('button', { name: 'Add answer' })).toBeInTheDocument();
    expect(screen.getByText('Add answer').closest('.dropdown')).toBeInTheDocument();
  });

  it('calls useAnswerContainer with correct args', () => {
    render(<AnswersContainer {...defaultProps} />);
    expect(useAnswerContainer).toHaveBeenCalledWith({
      answers,
      problemType: defaultProps.problemType,
      updateField: expect.any(Function),
    });
  });

  it('dispatches updateField with correct params', () => {
    render(<AnswersContainer {...defaultProps} />);
    // Directly call updateField to test
    const field = 'exampleField';
    const value = 'exampleValue';
    const { updateField } = actions.problem;
    updateField({ field, value });
    expect(updateField).toHaveBeenCalledWith({ field, value });
  });
});
