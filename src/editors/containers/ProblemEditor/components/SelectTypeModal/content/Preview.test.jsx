import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../../../testUtils';
import { PreviewInternal as Preview } from './Preview';

describe('Preview', () => {
  const props = {
    intl: { formatMessage },
    problemType: null,
  };
  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<Preview {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is stringresponse', () => {
      expect(
        shallow(<Preview {...props} problemType="stringresponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is numericalresponse', () => {
      expect(
        shallow(<Preview {...props} problemType="numericalresponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is optionresponse', () => {
      expect(
        shallow(<Preview {...props} problemType="optionresponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is choiceresponse', () => {
      expect(
        shallow(<Preview {...props} problemType="choiceresponse" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with problemType is multiplechoiceresponse', () => {
      expect(
        shallow(<Preview {...props} problemType="multiplechoiceresponse" />).snapshot,
      ).toMatchSnapshot();
    });
  });
});
