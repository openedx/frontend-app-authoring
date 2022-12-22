import React from 'react';
import { shallow } from 'enzyme';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import * as module from './ProblemTypeSelect';

describe('ProblemTypeSelect', () => {
  const props = {
    selected: null,
    setSelected: jest.fn(),
  };

  describe('snapshot', () => {
    test('SINGLESELECT', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.SINGLESELECT} />,
      )).toMatchSnapshot();
    });
    test('MULTISELECT', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.MULTISELECT} />,
      )).toMatchSnapshot();
    });
    test('DROPDOWN', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.DROPDOWN} />,
      )).toMatchSnapshot();
    });
    test('NUMERIC', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.NUMERIC} />,
      )).toMatchSnapshot();
    });
    test('TEXTINPUT', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.TEXTINPUT} />,
      )).toMatchSnapshot();
    });
  });
});
