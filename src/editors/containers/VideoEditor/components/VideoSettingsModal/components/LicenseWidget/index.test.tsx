import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import { formatMessage } from '../../../../../../testUtils';
import { LicenseWidgetInternal as LicenseWidget } from '.';

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
    intl: { formatMessage },
    isLibrary: false,
    licenseType: '',
    licenseDetails: {},
    courseLicenseType: 'all-rights-reserved',
    courseLicenseDetails: {},
    updateField: jest.fn().mockName('args.updateField'),
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders as expected with default props', () => {
    render(<LicenseWidget {...props} />);
    expect(screen.getByText('License')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add a license for this video' })).toBeInTheDocument();
  });
  test('renders as expected with isLibrary true', () => {
    render(<LicenseWidget {...props} isLibrary licenseType="all-rights-reserved" />);
    expect(screen.getByText('License')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add a license for this video' })).not.toBeInTheDocument();
  });
  test('renders as expected with licenseType defined', () => {
    render(<LicenseWidget {...props} licenseType="all-rights-reserved" />);
    expect(screen.getByText('License')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add a license for this video' })).not.toBeInTheDocument();
  });
});
