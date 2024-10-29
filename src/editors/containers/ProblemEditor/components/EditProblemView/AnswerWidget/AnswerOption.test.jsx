import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../testUtils';
import { selectors } from '../../../../../data/redux';
import { AnswerOptionInternal as AnswerOption, mapStateToProps } from './AnswerOption';

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
    title: 'Answer 1',
    correct: true,
    selectedFeedback: 'selected feedback',
    unselectedFeedback: 'unselected feedback',
    isAnswerRange: true,
  };

  const props = {
    hasSingleAnswer: false,
    answer: answerWithOnlyFeedback,
    // inject
    intl: { formatMessage },
    // redux
    problemType: 'multiplechoiceresponse',
    images: {},
    isLibrary: false,
    learningContextId: 'course+org+run',
  };
  describe('render', () => {
    test('snapshot: renders correct option with feedback', () => {
      expect(shallow(<AnswerOption {...props} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: renders correct option with selected unselected feedback', () => {
      expect(shallow(<AnswerOption {...props} problemType="choiceresponse" answer={answerWithSelectedUnselectedFeedback} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: renders correct option with numeric input problem', () => {
      expect(shallow(<AnswerOption {...props} problemType="numericalresponse" />).snapshot).toMatchSnapshot();
    });
    test('snapshot: renders correct option with numeric input problem and answer range', () => {
      expect(shallow(<AnswerOption {...props} problemType="numericalresponse" answer={answerRange} />).snapshot).toMatchSnapshot();
    });
  });

  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('problemType from problem.problemType', () => {
      expect(
        mapStateToProps(testState).problemType,
      ).toEqual(selectors.problem.problemType(testState));
    });
    test('images from app.images', () => {
      expect(
        mapStateToProps(testState).images,
      ).toEqual(selectors.app.images(testState));
    });
    test('learningContextId from app.learningContextId', () => {
      expect(
        mapStateToProps(testState).learningContextId,
      ).toEqual(selectors.app.learningContextId(testState));
    });
    test('isLibrary from app.isLibrary', () => {
      expect(
        mapStateToProps(testState).isLibrary,
      ).toEqual(selectors.app.isLibrary(testState));
    });
  });
});
