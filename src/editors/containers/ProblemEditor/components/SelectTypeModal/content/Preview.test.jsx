import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../../testUtils';
import * as module from './Preview';

describe('Preview', () => {
  const props = {
    intl: { formatMessage },
    problemType: null,
  };
  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<module.Preview {...props} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is stringresponse', () => {
      expect(
        shallow(<module.Preview {...props} problemType="stringresponse" />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is numericalresponse', () => {
      expect(
        shallow(<module.Preview {...props} problemType="numericalresponse" />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is optionresponse', () => {
      expect(
        shallow(<module.Preview {...props} problemType="optionresponse" />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is choiceresponse', () => {
      expect(
        shallow(<module.Preview {...props} problemType="choiceresponse" />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is multiplechoiceresponse', () => {
      expect(
        shallow(<module.Preview {...props} problemType="multiplechoiceresponse" />),
      ).toMatchSnapshot();
    });
  });
});
