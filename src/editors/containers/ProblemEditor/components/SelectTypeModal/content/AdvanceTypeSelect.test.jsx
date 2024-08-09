import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../../../../testUtils';
import * as module from './AdvanceTypeSelect';

describe('AdvanceTypeSelect', () => {
  const props = {
    intl: { formatMessage },
    selected: 'blankadvanced',
    setSelected: jest.fn().mockName('setSelect'),
  };
  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is circuitschematic', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} selected="circuitschematic" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is customgrader', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} selected="customgrader" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is drag_and_drop', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} selected="drag_and_drop" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is formularesponse', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} selected="formularesponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is imageresponse', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} selected="imageresponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is jsinput_response', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} selected="jsinput_response" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is problem_with_hint', () => {
      expect(
        shallow(<module.AdvanceTypeSelect {...props} selected="problem_with_hint" />).snapshot,
      ).toMatchSnapshot();
    });
  });
});
