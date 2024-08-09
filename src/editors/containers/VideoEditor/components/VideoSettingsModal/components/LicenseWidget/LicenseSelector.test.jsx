import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { LicenseSelectorInternal as LicenseSelector, mapStateToProps, mapDispatchToProps } from './LicenseSelector';

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    ...jest.requireActual('react'),
    updateState,
    useContext: jest.fn(() => ({ license: ['error.license', jest.fn().mockName('error.setLicense')] })),
  };
});

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
    dispatch: dispatchFn,
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    video: {
      courseLicenseType: jest.fn(state => ({ courseLicenseType: state })),
    },
  },
}));

describe('LicenseSelector', () => {
  const props = {
    intl: { formatMessage },
    license: 'all-rights-reserved',
    level: 'course',
    courseLicenseType: 'all-rights-reserved',
    updateField: jest.fn().mockName('args.updateField'),
  };
  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<LicenseSelector {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with library level', () => {
      expect(
        shallow(<LicenseSelector {...props} level="library" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with block level', () => {
      expect(
        shallow(<LicenseSelector {...props} level="block" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with no license', () => {
      expect(
        shallow(<LicenseSelector {...props} license="" />).snapshot,
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('courseLicenseType from video.courseLicenseType', () => {
      expect(
        mapStateToProps(testState).courseLicenseType,
      ).toEqual(selectors.video.courseLicenseType(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
