import { render, fireEvent } from '@testing-library/react';
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

  it('should call onToggleCheckbox event onClick', async () => {
    const { getAllByRole } = render(<RootWrapper {...props} />);
    const checkboxList = getAllByRole('checkbox');
    expect(props.onToggleCheckbox).not.toHaveBeenCalled();
    fireEvent.click(checkboxList[1]);
    expect(props.onToggleCheckbox).toHaveBeenCalledWith(LICENSE_COMMONS_OPTIONS.nonCommercial);
    // Note: there is no point in asserting that the checkbox is now checked,
    // because it is a controlled component that never changes unless the props change.
    // This test should really be implemented in a higher level component/page.
    // await waitFor(() => {
    //   expect(checkboxList[1].checked).toBeFalsy();
    // });
  });
});
