import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { LicenseWidgetInternal as LicenseWidget, mapStateToProps, mapDispatchToProps } from '.';

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
  selectors: {
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
    video: {
      licenseType: jest.fn(state => ({ licenseType: state })),
      licenseDetails: jest.fn(state => ({ licenseDetails: state })),
      courseLicenseType: jest.fn(state => ({ courseLicenseType: state })),
      courseLicenseDetails: jest.fn(state => ({ courseLicenseDetails: state })),
    },
  },
}));

describe('LicenseWidget', () => {
  const props = {
    error: {},
    subtitle: 'SuBTItle',
    title: 'tiTLE',
    intl: { formatMessage },
    isLibrary: false,
    licenseType: null,
    licenseDetails: {},
    courseLicenseType: 'all-rights-reserved',
    courseLicenseDetails: {},
    updateField: jest.fn().mockName('args.updateField'),
  };

  describe('snapshots', () => {
    // determineLicense.mockReturnValue({
    //   license: false,
    //   details: jest.fn().mockName('modal.openModal'),
    //   level: 'course',
    // });
    // determineText.mockReturnValue({
    //   isSourceCodeOpen: false,
    //   openSourceCodeModal: jest.fn().mockName('modal.openModal'),
    //   closeSourceCodeModal: jest.fn().mockName('modal.closeModal'),
    // });
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<LicenseWidget {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with isLibrary true', () => {
      expect(
        shallow(<LicenseWidget {...props} isLibrary licenseType="all-rights-reserved" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with licenseType defined', () => {
      expect(
        shallow(<LicenseWidget {...props} licenseType="all-rights-reserved" />).snapshot,
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('isLibrary from app.isLibrary', () => {
      expect(
        mapStateToProps(testState).isLibrary,
      ).toEqual(selectors.app.isLibrary(testState));
    });
    test('licenseType from video.licenseType', () => {
      expect(
        mapStateToProps(testState).licenseType,
      ).toEqual(selectors.video.licenseType(testState));
    });
    test('licenseDetails from video.licenseDetails', () => {
      expect(
        mapStateToProps(testState).licenseDetails,
      ).toEqual(selectors.video.licenseDetails(testState));
    });
    test('courseLicenseType from video.courseLicenseType', () => {
      expect(
        mapStateToProps(testState).courseLicenseType,
      ).toEqual(selectors.video.courseLicenseType(testState));
    });
    test('courseLicenseDetails from video.courseLicenseDetails', () => {
      expect(
        mapStateToProps(testState).courseLicenseDetails,
      ).toEqual(selectors.video.courseLicenseDetails(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
