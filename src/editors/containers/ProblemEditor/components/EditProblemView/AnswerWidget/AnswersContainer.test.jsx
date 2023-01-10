import React from 'react';
import { shallow } from 'enzyme';
import { actions, selectors } from '../../../../../data/redux';

import * as module from './AnswersContainer';

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
      expect(shallow(<module.AnswersContainer {...props} />)).toMatchSnapshot();
    });
    test('snapshot: renders correctly with answers', () => {
      expect(shallow(<module.AnswersContainer answers={[{ id: 'a', title: 'sOMetITlE', correct: true }, { id: 'b', title: 'sOMetITlE', correct: true }]} {...props} />)).toMatchSnapshot();
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
