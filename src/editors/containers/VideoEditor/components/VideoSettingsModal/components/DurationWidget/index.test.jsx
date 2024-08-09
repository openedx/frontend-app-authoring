import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { actions, selectors } from '../../../../../../data/redux';
import { formatMessage } from '../../../../../../testUtils';
import { DurationWidgetInternal as DurationWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    video: {
      duration: jest.fn(state => ({ duration: state })),
    },
  },
}));

describe('DurationWidget', () => {
  const props = {
    duration: {
      startTime: '00:00:00',
      stopTime: '00:00:10',
    },
    updateField: jest.fn().mockName('updateField'),
    // inject
    intl: { formatMessage },
  };
  describe('render', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<DurationWidget {...props} />).snapshot,
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('duration from video.duration', () => {
      expect(
        mapStateToProps(testState).duration,
      ).toEqual(selectors.video.duration(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(actions.video.updateField);
    });
  });
});
