import React from 'react';
import { initializeMocks, render, screen } from '../../../../../../../testUtils';
import LicenseDisplay from './LicenseDisplay';

jest.mock('../../../../../../data/constants/licenses', () => ({
  LicenseTypes: {
    select: 'select',
    creativeCommons: 'creativeCommons',
    proprietary: 'proprietary',
  },
}));

const defaultDetails = {
  attribution: true,
  noncommercial: false,
  noDerivatives: false,
  shareAlike: false,
};

describe('LicenseDisplay', () => {
  beforeEach(() => {
    initializeMocks();
  });
  it('renders nothing if license is select', () => {
    const { container } = render(
      <LicenseDisplay
        license="select"
        details={defaultDetails}
        level="course"
        licenseDescription="Some description"
      />,
    );
    const reduxProviderDiv = container.querySelector('div[data-testid="redux-provider"]');
    expect(reduxProviderDiv?.innerHTML).toBe('');
  });

  it('renders displaySubsectionTitle and licenseDescription for non-select license', () => {
    render(
      <LicenseDisplay
        license="proprietary"
        details={defaultDetails}
        level="course"
        licenseDescription="Proprietary license description"
      />,
    );
    expect(screen.getByText('License Display')).toBeInTheDocument();
    expect(screen.getByText('Proprietary license description')).toBeInTheDocument();
  });

  it('renders Hyperlink for creativeCommons license', () => {
    render(
      <LicenseDisplay
        license="creativeCommons"
        details={defaultDetails}
        level="course"
        licenseDescription="Creative Commons description"
      />,
    );
    const link = screen.getByRole('link', { name: 'View license details in a new tab' });
    expect(link).toHaveAttribute('href', 'https://creativecommons.org/about');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('does not render Hyperlink for non-creativeCommons license', () => {
    render(
      <LicenseDisplay
        license="proprietary"
        details={defaultDetails}
        level="course"
        licenseDescription="desc"
      />,
    );
    expect(screen.queryByRole('link', { name: 'View Details' })).toBeNull();
  });
});
