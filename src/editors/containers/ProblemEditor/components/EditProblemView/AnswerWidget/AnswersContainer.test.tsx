import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../../../../testUtils';
import { AnswersContainerInternal as AnswersContainer } from './AnswersContainer';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';

const { useAnswerContainer } = require('./hooks');

jest.mock('./AnswerOption', () => jest.fn(({ answer }) => <div>AnswerOption-{answer.id}</div>));
jest.mock(
  '../../../../../sharedComponents/Button',
  () => jest.fn(({ children, ...props }) => <button type="button" {...props}>{children}</button>),
);

jest.mock('./hooks', () => ({
  useAnswerContainer: jest.fn(),
  isSingleAnswerProblem: jest.fn(() => false),
}));

describe('AnswersContainer', () => {
  const defaultProps = {
    problemType: 'multiple_choice',
    answers: [
      { id: 'a1', isAnswerRange: false },
      { id: 'a2', isAnswerRange: false },
    ],
    addAnswer: jest.fn(),
    addAnswerRange: jest.fn(),
    updateField: jest.fn(),
  };

  beforeEach(() => {
    initializeMocks();
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
    expect(defaultProps.addAnswer).toHaveBeenCalled();
  });

  it('renders Dropdown for NUMERIC problemType', () => {
    render(<AnswersContainer {...defaultProps} problemType={ProblemTypeKeys.NUMERIC} />);
    expect(screen.getByRole('button', { name: 'Add answer' })).toBeInTheDocument();
    expect(screen.getByText('Add answer').closest('.dropdown')).toBeInTheDocument();
  });

  it('calls useAnswerContainer with correct args', () => {
    render(<AnswersContainer {...defaultProps} />);
    expect(useAnswerContainer).toHaveBeenCalledWith({
      answers: defaultProps.answers,
      problemType: defaultProps.problemType,
      updateField: defaultProps.updateField,
    });
  });
});
