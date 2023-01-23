import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../testUtils';
import { AnswerOption } from './AnswerOption';

describe('AnswerOption', () => {
  const answerWithOnlyFeedback = {
    id: 'A',
    title: 'Answer 1',
    correct: true,
    feedback: 'some feedback',
  };
  const answerWithSelectedUnselectedFeedback = {
    id: 'A',
    title: 'Answer 1',
    correct: true,
    selectedFeedback: 'selected feedback',
    unselectedFeedback: 'unselected feedback',
  };

  const props = {
    hasSingleAnswer: false,
    answer: answerWithOnlyFeedback,
    // inject
    intl: { formatMessage },
    deleteAnswer: jest.fn(),
    updateAnswer: jest.fn(),
  };
  describe('render', () => {
    test('snapshot: renders correct option with feedback', () => {
      expect(shallow(<AnswerOption {...props} />)).toMatchSnapshot();
    });
    test('snapshot: renders correct option with selected unselected feedback', () => {
      expect(shallow(<AnswerOption {...props} answer={answerWithSelectedUnselectedFeedback} />)).toMatchSnapshot();
    });
  });
});
