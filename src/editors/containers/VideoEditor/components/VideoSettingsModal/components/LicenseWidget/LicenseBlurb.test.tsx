import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';

import LicenseBlurb from './LicenseBlurb';

describe('LicenseBlurb', () => {
  const props = {
    license: 'all-rights-reserved',
    details: {
      attribution: false,
      noncommercial: false,
      noDerivatives: false,
      shareAlike: false,

    },
  };

  beforeEach(() => initializeMocks());

  describe('snapshots', () => {
    test('renders as expected with default props', () => {
      const { container } = render(<LicenseBlurb {...props} />);
      expect(container.querySelectorAll('span.pgn__icon')).toHaveLength(1);
      expect(screen.getByText('All Rights Reserved')).toBeInTheDocument();
    });

    test('renders as expected with license equal to Creative Commons', () => {
      const { container } = render(<LicenseBlurb {...props} license="creative-commons" />);
      expect(container.querySelectorAll('span.pgn__icon')).toHaveLength(1);
      expect(screen.getByText('Some Rights Reserved')).toBeInTheDocument();
    });

    test('renders as expected when details.attribution equal true', () => {
      const { container } = render(<LicenseBlurb license="" details={{ ...props.details, attribution: true }} />);
      expect(container.querySelectorAll('span.pgn__icon')).toHaveLength(1);
    });

    test('renders as expected when details.attribution and details.noncommercial equal true', () => {
      const { container } = render(<LicenseBlurb license="" details={{ ...props.details, attribution: true, noncommercial: true }} />);
      expect(container.querySelectorAll('span.pgn__icon')).toHaveLength(2);
    });

    test('renders as expected when details.attribution and details.noDerivatives equal true', () => {
      const { container } = render(<LicenseBlurb license="" details={{ ...props.details, attribution: true, noDerivatives: true }} />);
      expect(container.querySelectorAll('span.pgn__icon')).toHaveLength(2);
    });

    test('renders as expected when details.attribution and details.shareAlike equal true', () => {
      const { container } = render(<LicenseBlurb license="" details={{ ...props.details, attribution: true, shareAlike: true }} />);
      expect(container.querySelectorAll('span.pgn__icon')).toHaveLength(2);
    });
  });
});
