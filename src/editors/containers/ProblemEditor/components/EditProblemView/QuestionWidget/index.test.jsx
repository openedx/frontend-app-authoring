/* eslint-disable react/prop-types */
import React from 'react';
import { shallow } from 'enzyme';
import { actions, selectors } from '../../../../../data/redux';
import { QuestionWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../../../../../data/redux', () => ({
  actions: {
    problem: {
      updateQuestion: jest.fn().mockName('actions.problem.updateQuestion'),
    },
  },
  selectors: {
    problem: {
      question: jest.fn(state => ({ question: state })),
    },
  },
}));

// Per https://github.com/tinymce/tinymce-react/issues/91 React unit testing in JSDOM is not supported by tinymce.
// Consequently, mock the Editor out.
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'TiNYmCE EDitOR',
  };
});

jest.mock('../../../hooks', () => ({
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('hooks.prepareEditorRef.setEditorRef'),
  })),
  problemEditorConfig: jest.fn(args => ({ problemEditorConfig: args })),
}));

describe('QuestionWidget', () => {
  const props = {
    question: 'This is my question',
    updateQuestion: jest.fn(),
  };
  describe('render', () => {
    test('snapshot: renders correct default', () => {
      expect(shallow(<QuestionWidget {...props} />)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('question from problem.question', () => {
      expect(mapStateToProps(testState).question).toEqual(selectors.problem.question(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateQuestion', () => {
      expect(mapDispatchToProps.updateQuestion).toEqual(actions.problem.updateQuestion);
    });
  });
});
