import React from 'react';
import {
  render, fireEvent, screen, initializeMocks,
} from '@src/testUtils';
import { LicenseSelectorInternal } from './LicenseSelector';
import * as hooks from './hooks';

jest.mock('./hooks', () => ({
  determineText: jest.fn(() => ({ levelDescription: 'Test level description' })),
  onSelectLicense: jest.fn(() => jest.fn()),
}));

const LicenseTypes = {
  select: 'select',
  allRightsReserved: 'All Rights Reserved',
  creativeCommons: 'Creative Commons',
};
const LicenseLevel = { course: 'course', video: 'video' };

describe('LicenseSelectorInternal', () => {
  const updateField = jest.fn();
  const onLicenseChange = jest.fn();
  const props = {
    license: LicenseTypes.select,
    level: LicenseLevel.video,
    courseLicenseType: LicenseTypes.select,
    updateField,
  };

  beforeEach(() => {
    initializeMocks();
    (hooks.onSelectLicense as jest.Mock).mockReturnValue(onLicenseChange);
    (hooks.determineText as jest.Mock).mockReturnValue({ levelDescription: 'Test level description' });
  });

  it('renders select with correct options and default value', () => {
    render(<LicenseSelectorInternal {...props} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe(props.license);
    expect(screen.getByText(LicenseTypes.allRightsReserved)).toBeInTheDocument();
    expect(screen.getByText(LicenseTypes.creativeCommons)).toBeInTheDocument();
  });

  it('disables select when level is course', () => {
    render(<LicenseSelectorInternal {...props} level={LicenseLevel.course} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows delete button when level is not course', () => {
    render(<LicenseSelectorInternal {...props} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not show delete button when level is course', () => {
    render(<LicenseSelectorInternal {...props} level={LicenseLevel.course} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onLicenseChange when select changes', () => {
    render(<LicenseSelectorInternal {...props} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: LicenseTypes.select } });
    expect(onLicenseChange).toHaveBeenCalledWith(LicenseTypes.select);
  });

  it('calls updateField and resets select when delete button clicked', () => {
    render(<LicenseSelectorInternal {...props} />);
    fireEvent.click(screen.getByRole('button'));
    expect(updateField).toHaveBeenCalledWith({ licenseType: '', licenseDetails: {} });
  });

  it('renders level description', () => {
    render(<LicenseSelectorInternal {...props} />);
    expect(screen.getByText('Test level description')).toBeInTheDocument();
  });

  it('renders border when license is not select', () => {
    const { container } = render(<LicenseSelectorInternal {...props} license={LicenseTypes.allRightsReserved} />);
    expect(container.querySelector('.border-primary-100')).toBeInTheDocument();
  });

  it('does not render border when license is select', () => {
    const { container } = render(<LicenseSelectorInternal {...props} license={LicenseTypes.select} />);
    expect(container.querySelector('.border-primary-100')).not.toBeInTheDocument();
  });
});
