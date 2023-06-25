import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ModalErrorListItem from './ModalErrorListItem';

const settingName = {
  key: 'exampleKey',
  message: 'Error message',
};

const settingsData = {
  exampleKey: {
    displayName: 'Error field',
  },
};

const RootWrapper = () => (
  <IntlProvider locale="en">
    <ModalErrorListItem settingName={settingName} settingsData={settingsData} />
  </IntlProvider>
);

describe('<ModalErrorListItem />', () => {
  it('renders the display name and error message', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Error field:')).toBeInTheDocument();
    expect(getByText('Error message')).toBeInTheDocument();
  });
  it('renders the alert with variant "danger"', () => {
    const { getByRole } = render(<RootWrapper />);
    expect(getByRole('alert')).toHaveClass('alert-danger');
  });
});
