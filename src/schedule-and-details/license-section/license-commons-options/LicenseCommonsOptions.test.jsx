import React from 'react';
import {
  render, fireEvent, act, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { LICENSE_COMMONS_OPTIONS } from '../constants';
import messages from './messages';
import LicenseCommonsOptions from '.';

const onToggleCheckboxMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <LicenseCommonsOptions {...props} />
  </IntlProvider>
);

const props = {
  licenseDetails: {
    attribution: true,
    nonCommercial: true,
    noDerivatives: true,
    shareAlike: false,
  },
  onToggleCheckbox: onToggleCheckboxMock,
};

describe('<LicenseCommonsOptions />', () => {
  it('renders successfully', () => {
    const { getByText, getAllByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.licenseCreativeOptionsLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.licenseCreativeOptionsHelpText.defaultMessage)).toBeInTheDocument();
    expect(getAllByRole('checkbox').length).toBe(4);
  });

  it('should render checkbox list correct', () => {
    const { getAllByRole } = render(<RootWrapper {...props} />);
    const checkboxList = getAllByRole('checkbox');
    expect(checkboxList[0].checked).toBeTruthy();
    expect(checkboxList[0].disabled).toBeTruthy();
    expect(checkboxList[1].checked).toBeTruthy();
    expect(checkboxList[2].checked).toBeTruthy();
    expect(checkboxList[3].checked).toBeFalsy();
  });

  it('should call onToggleCheckbox event onClick', () => {
    const { getAllByRole } = render(<RootWrapper {...props} />);
    const checkboxList = getAllByRole('checkbox');
    act(() => {
      fireEvent.click(checkboxList[1]);
    });
    expect(props.onToggleCheckbox).toHaveBeenCalledWith(LICENSE_COMMONS_OPTIONS.nonCommercial);
    waitFor(() => {
      expect(checkboxList[1].checked).toBeFalsy();
    });
  });
});
