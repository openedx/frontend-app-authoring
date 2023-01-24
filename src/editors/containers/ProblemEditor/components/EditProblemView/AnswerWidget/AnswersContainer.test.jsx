/* eslint-disable react/prop-types */
import React from 'react';
import { shallow } from 'enzyme';
import { act, render, waitFor } from '@testing-library/react';

import { actions, selectors } from '../../../../../data/redux';

import * as module from './AnswersContainer';

import { AnswersContainer as AnswersContainerWithoutHOC } from './AnswersContainer';

jest.mock('@edx/frontend-platform/i18n', () => ({
  FormattedMessage: ({ defaultMessage }) => (<p>{defaultMessage}</p>),
  injectIntl: (args) => args,
  intlShape: {},
}));

jest.mock('./AnswerOption', () => () => <div>MockAnswerOption</div>);

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
        expect(shallow(<module.AnswersContainer {...props} />)).toMatchSnapshot();
      });
    });
    test('snapshot: renders correctly with answers', () => {
      act(() => {
        expect(shallow(
          <module.AnswersContainer
            {...props}
            answers={[{ id: 'a', title: 'sOMetITlE', correct: true }, { id: 'b', title: 'sOMetITlE', correct: true }]}
          />,
        )).toMatchSnapshot();
      });
    });

    test('with react-testing-library', async () => {
      let container = null;
      await act(async () => {
        const wrapper = render(
          <AnswersContainerWithoutHOC
            {...props}
            answers={[{ id: 'a', title: 'sOMetITlE', correct: true }, { id: 'b', title: 'sOMetITlE', correct: true }]}
          />,
        );
        container = wrapper.container;
      });

      await waitFor(() => expect(container.querySelector('button')).toBeTruthy());
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(props.updateField).toHaveBeenCalledWith(expect.objectContaining({ correctAnswerCount: 2 }));
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('answers from problem.answers', () => {
      expect(
        module.mapStateToProps(testState).answers,
      ).toEqual(selectors.problem.answers(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateField', () => {
      expect(module.mapDispatchToProps.updateField).toEqual(actions.problem.updateField);
    });
    test('updateField from actions.problem.addAnswer', () => {
      expect(module.mapDispatchToProps.addAnswer).toEqual(actions.problem.addAnswer);
    });
  });
});
