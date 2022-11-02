import React from 'react';
import { shallow } from 'enzyme';

import { LicenseBlurb } from './LicenseBlurb';

describe('LicenseBlurb', () => {
  const props = {
    license: 'all-rights-reserved',
    details: {},
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<LicenseBlurb {...props} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with license equal to Creative Commons', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true }} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution and details.noncommercial equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true, noncommercial: true }} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution and details.noDerivatives equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true, noDerivatives: true }} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected when details.attribution and details.shareAlike equal true', () => {
      expect(
        shallow(<LicenseBlurb {...props} license="creative-commons" details={{ attribution: true, shareAlike: true }} />),
      ).toMatchSnapshot();
    });
  });
});
