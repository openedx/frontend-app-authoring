/* eslint-disable react/prop-types */
import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { act, render, waitFor } from '@testing-library/react';

import { actions, selectors } from '../../../../../data/redux';

import { AnswersContainerInternal as AnswersContainer, mapStateToProps, mapDispatchToProps } from './AnswersContainer';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';

jest.mock('@edx/frontend-platform/i18n', () => ({
  FormattedMessage: ({ defaultMessage }) => (<p>{defaultMessage}</p>),
  defineMessages: m => m,
  injectIntl: (args) => args,
  intlShape: {},
  getLocale: jest.fn(),
}));

jest.mock('./AnswerOption', () => function mockAnswerOption() {
  return <div>MockAnswerOption</div>;
});

jest.mock('../../../../../data/redux', () => ({
  actions: {
    problem: {
      updateField: jest.fn().mockName('actions.problem.updateField'),
      addAnswer: jest.fn().mockName('actions.problem.addAnswer'),
    },
  },
  selectors: {
    problem: {
      answers: jest.fn(state => ({ answers: state })),
    },
  },
}));
describe('AnswersContainer', () => {
  const props = {
    answers: [],
    updateField: jest.fn(),
    addAnswer: jest.fn(),
  };
  describe('render', () => {
    test('snapshot: renders correct default', () => {
      act(() => {
        expect(shallow(<AnswersContainer {...props} />).snapshot).toMatchSnapshot();
      });
    });
    test('snapshot: renders correctly with answers', () => {
      act(() => {
        expect(shallow(
          <AnswersContainer
            {...props}
            answers={[{ id: 'a', title: 'sOMetITlE', correct: true }, { id: 'b', title: 'sOMetITlE', correct: true }]}
          />,
        ).snapshot).toMatchSnapshot();
      });
    });
    test('snapshot: numeric problems: answer range/answer select button: empty', () => {
      act(() => {
        const emptyAnswerProps = {
          problemType: ProblemTypeKeys.NUMERIC,
          answers: [],
          updateField: jest.fn(),
          addAnswer: jest.fn(),
          addAnswerRange: jest.fn(),
        };
        expect(shallow(
          <AnswersContainer
            {...emptyAnswerProps}
          />,
        ).snapshot).toMatchSnapshot();
      });
    });
    test('snapshot: numeric problems: answer range/answer select button: Range disables the additon of more adds', () => {
      act(() => {
        const answerRangeProps = {
          problemType: ProblemTypeKeys.NUMERIC,
          answers: [{
            id: 'A',
            title: 'Answer 1',
            correct: true,
            selectedFeedback: 'selected feedback',
            unselectedFeedback: 'unselected feedback',
            isAnswerRange: true,
          }],
          updateField: jest.fn(),
          addAnswer: jest.fn(),
          addAnswerRange: jest.fn(),
        };
        expect(shallow(
          <AnswersContainer
            {...answerRangeProps}
          />,
        ).snapshot).toMatchSnapshot();
      });
    });
    test('snapshot: numeric problems: answer range/answer select button: multiple answers disables range.', () => {
      act(() => {
        const answersProps = {
          problemType: ProblemTypeKeys.NUMERIC,
          answers: [{
            id: 'A',
            title: 'Answer 1',
            correct: true,
            selectedFeedback: 'selected feedback',
            unselectedFeedback: 'unselected feedback',
            isAnswerRange: false,
          },
          {
            id: 'B',
            title: 'Answer 1',
            correct: true,
            selectedFeedback: 'selected feedback',
            unselectedFeedback: 'unselected feedback',
            isAnswerRange: false,
          },
          ],
          updateField: jest.fn(),
          addAnswer: jest.fn(),
          addAnswerRange: jest.fn(),
        };
        expect(shallow(
          <AnswersContainer
            {...answersProps}
          />,
        ).snapshot).toMatchSnapshot();
      });
    });

    test('useAnswerContainer', async () => {
      let container = null;
      await act(async () => {
        const wrapper = render(
          <AnswersContainer
            {...props}
            answers={[{ id: 'a', title: 'sOMetITlE', correct: true }, { id: 'b', title: 'sOMetITlE', correct: true }]}
          />,
        );
        container = wrapper.container;
      });

      await waitFor(() => expect(container.querySelector('button')).toBeTruthy());
      await new Promise(resolve => { setTimeout(resolve, 500); });

      expect(props.updateField).toHaveBeenCalledWith(expect.objectContaining({ correctAnswerCount: 2 }));
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('answers from problem.answers', () => {
      expect(
        mapStateToProps(testState).answers,
      ).toEqual(selectors.problem.answers(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(actions.problem.updateField);
    });
    test('updateField from actions.problem.addAnswer', () => {
      expect(mapDispatchToProps.addAnswer).toEqual(actions.problem.addAnswer);
    });
  });
});
