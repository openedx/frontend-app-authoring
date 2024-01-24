import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
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
      ).snapshot).toMatchSnapshot();
    });
    test('MULTISELECT', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.MULTISELECT} />,
      ).snapshot).toMatchSnapshot();
    });
    test('DROPDOWN', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.DROPDOWN} />,
      ).snapshot).toMatchSnapshot();
    });
    test('NUMERIC', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.NUMERIC} />,
      ).snapshot).toMatchSnapshot();
    });
    test('TEXTINPUT', () => {
      expect(shallow(
        <module.ProblemTypeSelect {...props} selected={ProblemTypeKeys.TEXTINPUT} />,
      ).snapshot).toMatchSnapshot();
    });
  });
});
