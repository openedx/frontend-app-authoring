import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import AnswerOption from './AnswerOption';
import * as hooks from './hooks';

jest.mock('../../../../../data/redux', () => ({
  __esModule: true,
  default: jest.fn(),
  selectors: {
    problem: {
      problemType: jest.fn(state => ({ problemType: state })),
    },
    app: {
      images: jest.fn(state => ({ images: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
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

describe('AnswerOption', () => {
  const answerWithOnlyFeedback = {
    id: 'A',
    title: 'Answer 1',
    correct: true,
    selectedFeedback: 'some feedback',
  };
  const answerWithSelectedUnselectedFeedback = {
    id: 'A',
    title: 'Answer 1',
    correct: true,
    selectedFeedback: 'selected feedback',
    unselectedFeedback: 'unselected feedback',
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
    // redux
    problemType: 'multiplechoiceresponse',
    images: {},
    isLibrary: false,
    learningContextId: 'course+org+run',
    blockId: 'block-id',
  };

  beforeEach(() => {
    initializeMocks();
    jest.spyOn(hooks, 'removeAnswer').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setAnswer').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setAnswerTitle').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setSelectedFeedback').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'setUnselectedFeedback').mockReturnValue(jest.fn());
    jest.spyOn(hooks, 'useFeedback').mockReturnValue({
      isFeedbackVisible: false,
      toggleFeedback: jest.fn(),
    });
  });

  test('renders correct option with feedback', () => {
    render(<AnswerOption {...props} />);
    expect(screen.getByText(answerWithOnlyFeedback.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete answer' })).toBeInTheDocument();
  });

  test('renders correct option with selected unselected feedback', () => {
    const myProps = { ...props, problemType: 'choiceresponse' };
    render(<AnswerOption {...myProps} answer={answerWithSelectedUnselectedFeedback} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(answerWithOnlyFeedback.title)).toBeInTheDocument();
  });

  test('renders correct option with optionresponse input problem', () => {
    const myProps = { ...props, problemType: 'optionresponse' };
    render(<AnswerOption {...myProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(answerWithOnlyFeedback.title)).toBeInTheDocument();
  });

  test('renders correct option with numeric input problem and answer range', () => {
    const myProps = { ...props, problemType: 'numericalresponse' };
    render(<AnswerOption {...myProps} answer={answerRange} />);
    expect(screen.getByText(answerRange.title)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
