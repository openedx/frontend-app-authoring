import React from 'react';
import {
  render,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { LICENSE_TYPE } from '../constants';
import messages from './messages';
import LicenseDisplay from '.';

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <LicenseDisplay {...props} />
  </IntlProvider>
);

const props = {
  licenseType: LICENSE_TYPE.allRightsReserved,
  licenseDetails: {},
  licenseURL: 'link://to-license.ua',
};

describe('<LicenseDisplay />', () => {
  it('renders successfully', () => {
    const { getByText, queryAllByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.licenseDisplayLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.licenseDisplayParagraph.defaultMessage)).toBeInTheDocument();
    expect(queryAllByRole('img', { hidden: true }).length).toBe(1);
  });
});
