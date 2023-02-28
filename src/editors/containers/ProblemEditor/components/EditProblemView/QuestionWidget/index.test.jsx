/* eslint-disable react/prop-types */
import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../testUtils';
import { actions, selectors } from '../../../../../data/redux';
import { QuestionWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../../../../../data/redux', () => ({
  actions: {
    problem: {
      updateQuestion: jest.fn().mockName('actions.problem.updateQuestion'),
    },
  },
  selectors: {
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
      lmsEndpointUrl: jest.fn(state => ({ lmsEndpointUrl: state })),
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
      assets: jest.fn(state => ({ assets: state })),
    },
    problem: {
      question: jest.fn(state => ({ question: state })),
    },
  },
}));

jest.mock('../../../hooks', () => ({
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('hooks.prepareEditorRef.setEditorRef'),
  })),
  problemEditorConfig: jest.fn(args => ({ problemEditorConfig: args })),
}));

describe('QuestionWidget', () => {
  const props = {
    isLibrary: false,
    question: 'This is my question',
    updateQuestion: jest.fn(),
    lmsEndpointUrl: 'sOmEvaLue.cOm',
    studioEndpointUrl: 'sOmEoThERvaLue.cOm',
    assets: {},
    // injected
    intl: { formatMessage },
  };
  describe('render', () => {
    test('snapshot: renders correct default', () => {
      expect(shallow(<QuestionWidget {...props} />)).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('isLibrary from app.isLibrary', () => {
      expect(mapStateToProps(testState).isLibrary).toEqual(selectors.app.isLibrary(testState));
    });
    test('assets from app.assets', () => {
      expect(
        mapStateToProps(testState).assets,
      ).toEqual(selectors.app.assets(testState));
    });
    test('question from problem.question', () => {
      expect(mapStateToProps(testState).question).toEqual(selectors.problem.question(testState));
    });
    test('lmsEndpointUrl from app.lmsEndpointUrl', () => {
      expect(
        mapStateToProps(testState).lmsEndpointUrl,
      ).toEqual(selectors.app.lmsEndpointUrl(testState));
    });
    test('studioEndpointUrl from app.studioEndpointUrl', () => {
      expect(
        mapStateToProps(testState).studioEndpointUrl,
      ).toEqual(selectors.app.studioEndpointUrl(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateQuestion', () => {
      expect(mapDispatchToProps.updateQuestion).toEqual(actions.problem.updateQuestion);
    });
  });
});
