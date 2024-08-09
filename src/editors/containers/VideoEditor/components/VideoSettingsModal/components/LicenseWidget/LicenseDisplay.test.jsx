import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { LicenseDisplayInternal as LicenseDisplay } from './LicenseDisplay';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({ license: ['error.license', jest.fn().mockName('error.setLicense')] })),
}));

describe('LicenseDisplay', () => {
  const props = {
    license: 'all-rights-reserved',
    details: {},
    licenseDescription: 'FormattedMessage component with license description',
    level: 'course',
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<LicenseDisplay {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to library', () => {
      expect(
        shallow(<LicenseDisplay {...props} level="library" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to block', () => {
      expect(
        shallow(<LicenseDisplay {...props} level="block" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to block and license set to select', () => {
      expect(
        shallow(<LicenseDisplay {...props} level="block" license="select" />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with level set to block and license set to Creative Commons', () => {
      expect(
        shallow(<LicenseDisplay {...props} level="block" license="creative-commons" />).snapshot,
      ).toMatchSnapshot();
    });
  });
});
