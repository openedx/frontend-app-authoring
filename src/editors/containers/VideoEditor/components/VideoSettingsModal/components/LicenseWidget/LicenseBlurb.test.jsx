import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { LicenseBlurbInternal as LicenseBlurb } from './LicenseBlurb';

describe('LicenseBlurb', () => {
  const props = {
    license: 'all-rights-reserved',
    details: {},
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<LicenseBlurb {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with license equal to Creative Commons', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true }} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution and details.noncommercial equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true, noncommercial: true }} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution and details.noDerivatives equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true, noDerivatives: true }} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution and details.shareAlike equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true, shareAlike: true }} />).snapshot,
      ).toMatchSnapshot();
    });
  });
});
