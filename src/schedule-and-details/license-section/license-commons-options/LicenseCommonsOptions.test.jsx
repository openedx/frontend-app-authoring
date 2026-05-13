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
  });

  it('disables all non-fixed checkboxes when isEditable is false', () => {
    const { getAllByRole } = render(<RootWrapper {...props} isEditable={false} />);
    const checkboxList = getAllByRole('checkbox');
    // All checkboxes (including attribution which is always disabled) should be disabled
    checkboxList.forEach((checkbox) => expect(checkbox).toBeDisabled());
  });

  it('does not call onToggleCheckbox when clicked while isEditable is false', () => {
    onToggleCheckboxMock.mockClear();
    const { getAllByRole } = render(<RootWrapper {...props} isEditable={false} />);
    const checkboxList = getAllByRole('checkbox');
    fireEvent.click(checkboxList[1]);
    expect(onToggleCheckboxMock).not.toHaveBeenCalled();
  });

  it('non-fixed checkboxes are enabled when isEditable is true', () => {
    const { getAllByRole } = render(<RootWrapper {...props} isEditable />);
    const checkboxList = getAllByRole('checkbox');
    // checkboxList[0] is attribution (always disabled), rest should be enabled
    expect(checkboxList[1]).not.toBeDisabled();
    expect(checkboxList[2]).not.toBeDisabled();
    expect(checkboxList[3]).not.toBeDisabled();
  });
});
