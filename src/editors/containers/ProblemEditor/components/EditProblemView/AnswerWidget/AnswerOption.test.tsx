import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import { selectors } from '@src/editors/data/redux';
import AnswerOption from './AnswerOption';
import * as hooks from './hooks';

const { problem } = selectors;

jest.mock('@src/editors/data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  selectors: {
    problem: {
      problemType: jest.fn().mockReturnValue(''),
    },
    app: {
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn().mockReturnValue(true),
      learningContextId: jest.fn(state => ({ learningContextId: state })),
      blockId: jest.fn(state => ({ blockId: state })),
    },
  },
  thunkActions: {
    video: {
      importTranscripts: jest.fn(),
    },
  },
}));

jest.mock('@src/editors/sharedComponents/ExpandableTextArea', () => 'ExpandableTextArea');

describe('AnswerOption', () => {
  const answerWithOnlyFeedback = {
    id: 'A',
    title: 'Answer 1',
    correct: true,
    selectedFeedback: 'some feedback',
    isAnswerRange: true,
  };
  const answerWithSelectedUnselectedFeedback = {
    id: 'B',
    title: 'Answer 2',
    correct: true,
    selectedFeedback: 'selected feedback',
    unselectedFeedback: 'unselected feedback',
    isAnswerRange: false,
  };
  const answerRange = {
    id: 'A',
    title: 'Answer Range 1',
    correct: true,
    selectedFeedback: 'selected feedback',
    unselectedFeedback: 'unselected feedback',
    isAnswerRange: true,
  };

  const props = {
    hasSingleAnswer: false,
    answer: answerWithOnlyFeedback,
  };

  beforeEach(() => {
    jest.spyOn(hooks, 'removeAnswer').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setAnswer').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setAnswerTitle').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setSelectedFeedback').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setUnselectedFeedback').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'useFeedback').mockReturnValue({
      isFeedbackVisible: false,
      toggleFeedback: jest.fn(),
    });
    initializeMocks();
  });

  test('renders correct option with feedback', () => {
    jest.spyOn(problem, 'problemType').mockReturnValue('multiplechoiceresponse');
    render(<AnswerOption {...props} />);
    expect(screen.getByPlaceholderText('Enter an answer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete answer' })).toBeInTheDocument();
  });

  test('renders correct option with selected unselected feedback', () => {
    jest.spyOn(problem, 'problemType').mockReturnValue('choiceresponse');
    const myProps = { ...props, answer: answerWithSelectedUnselectedFeedback };
    render(<AnswerOption {...myProps} />);
    expect(screen.getByText(answerWithSelectedUnselectedFeedback.id)).toBeInTheDocument();
  });

  test('renders correct option with optionresponse input problem', () => {
    jest.spyOn(problem, 'problemType').mockReturnValue('optionresponse');
    const myProps = { ...props };
    render(<AnswerOption {...myProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(answerWithOnlyFeedback.title)).toBeInTheDocument();
  });

  test('renders correct option with numeric input problem and answer range', () => {
    jest.spyOn(problem, 'problemType').mockReturnValue('numericalresponse');
    const myProps = { ...props };
    render(<AnswerOption {...myProps} answer={answerRange} />);
    expect(screen.getByText(answerRange.title)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
