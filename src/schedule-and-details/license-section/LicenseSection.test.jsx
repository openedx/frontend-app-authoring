import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../__mocks__';
import messages from './messages';
import LicenseSection from '.';

const onChangeMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <LicenseSection {...props} />
  </IntlProvider>
);

const props = {
  license: courseDetailsMock.license,
  onChange: onChangeMock,
};

describe('<LicenseSection />', () => {
  it('renders successfully', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText(messages.licenseTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.licenseDescription.defaultMessage)).toBeInTheDocument();
  });
});
