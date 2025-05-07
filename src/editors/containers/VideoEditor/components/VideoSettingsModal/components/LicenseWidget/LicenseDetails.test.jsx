import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { actions } from '../../../../../../data/redux';
import { LicenseDetailsInternal as LicenseDetails, mapStateToProps, mapDispatchToProps } from './LicenseDetails';

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    ...jest.requireActual('react'),
    updateState,
    useContext: jest.fn(() => ({ license: ['error.license', jest.fn().mockName('error.setLicense')] })),
  };
});

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
}));

describe('LicenseDetails', () => {
  const props = {
    license: null,
    details: {},
    level: 'course',
    updateField: jest.fn().mockName('args.updateField'),
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<LicenseDetails {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to library', () => {
      expect(
        shallow(<LicenseDetails {...props} level="library" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to block and license set to select', () => {
      expect(
        shallow(<LicenseDetails {...props} level="block" license="select" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to block and license set to all rights reserved', () => {
      expect(
        shallow(<LicenseDetails {...props} level="block" license="all-rights-reserved" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to block and license set to Creative Commons', () => {
      expect(
        shallow(<LicenseDetails {...props} level="block" license="creative-commons" />).snapshot,
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('mapStateToProps equals an empty object', () => {
      expect(mapStateToProps(testState)).toEqual({});
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
