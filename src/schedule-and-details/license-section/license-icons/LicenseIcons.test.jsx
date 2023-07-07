import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { LICENSE_TYPE } from '../constants';
import messages from './messages';
import LicenseIcons from '.';

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <LicenseIcons {...props} />
  </IntlProvider>
);

const props = {
  licenseType: LICENSE_TYPE.allRightsReserved,
  licenseDetails: {},
  licenseURL: 'link://to-license.ua',
};

describe('<LicenseIcons />', () => {
  it('renders all right reserved successfully', () => {
    const { getByText, queryAllByText, queryAllByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.allRightReservedLabel.defaultMessage)).toBeInTheDocument();
    expect(queryAllByText(messages.creativeCommonsReservedLabel.defaultMessage).length).toBe(0);
    expect(queryAllByRole('img', { hidden: true }).length).toBe(1);
  });

  it('renders some right reserved successfully', () => {
    const initialProps = { ...props, licenseType: LICENSE_TYPE.creativeCommons };
    const {
      getByText,
      queryAllByText,
      queryAllByRole,
      getByRole,
    } = render(<RootWrapper {...initialProps} />);
    expect(getByText(messages.creativeCommonsReservedLabel.defaultMessage)).toBeInTheDocument();
    expect(queryAllByText(messages.allRightReservedLabel.defaultMessage).length).toBe(0);
    expect(queryAllByRole('img', { hidden: true }).length).toBe(1);
    expect(getByRole('link').href).toBe(props.licenseURL);
  });

  it('should show needed icons following to licenseDetails', () => {
    const initialProps = {
      ...props,
      licenseType: LICENSE_TYPE.creativeCommons,
      licenseDetails: {
        attribution: true, nonCommercial: true, noDerivatives: false, shareAlike: false,
      },
    };
    const { getByText, queryAllByRole, debug } = render(<RootWrapper {...initialProps} />);
    debug(null, 20000);
    expect(queryAllByRole('img', { hidden: true }).length).toBe(3);
    expect(getByText(messages.creativeCommonsReservedLabel.defaultMessage)).toBeInTheDocument();
  });
});
