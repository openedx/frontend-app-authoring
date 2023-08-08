import React from 'react';
import {
  act, fireEvent, render, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { LICENSE_TYPE } from '../constants';
import messages from './messages';
import LicenseSelector from '.';

const onChangeLicenseTypeMock = jest.fn();
const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <LicenseSelector {...props} />
  </IntlProvider>
);

const props = {
  licenseType: LICENSE_TYPE.allRightsReserved,
  onChangeLicenseType: onChangeLicenseTypeMock,
};

describe('<LicenseSelector />', () => {
  it('renders successfully', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.licenseType.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.licenseChoice1.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.licenseChoice2.defaultMessage })).toBeInTheDocument();
  });

  it('should show active button', () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const activeButton = getByRole('button', { name: messages.licenseChoice1.defaultMessage });
    const anotherButton = getByRole('button', { name: messages.licenseChoice2.defaultMessage });
    expect(activeButton).toHaveClass('btn btn-primary');
    expect(anotherButton).toHaveClass('btn btn-outline-primary');
  });

  it('should call onChangeLicenseType if button clicked', () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const button = getByRole('button', { name: messages.licenseChoice2.defaultMessage });
    expect(button).toHaveClass('btn btn-outline-primary');
    act(() => {
      fireEvent.click(button);
    });
    waitFor(() => {
      expect(button).toHaveClass('btn btn-primary');
    });
    expect(props.onChangeLicenseType).toHaveBeenCalledWith(
      LICENSE_TYPE.creativeCommons,
      'license',
    );
  });

  it('should show disabled buttons if license is null', () => {
    const initialProps = { ...props, licenseType: null };
    const { getByRole } = render(<RootWrapper {...initialProps} />);
    const buttonFirst = getByRole('button', { name: messages.licenseChoice1.defaultMessage });
    const buttonSecond = getByRole('button', { name: messages.licenseChoice2.defaultMessage });
    expect(buttonFirst).toHaveClass('btn btn-outline-primary');
    expect(buttonSecond).toHaveClass('btn btn-outline-primary');
  });
});
