import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SettingAlert from '.';

const alertTitle = 'Test Title';
const alertDescription = 'Test Description';
const alertClassName = 'custom-class';

const RootWrapper = () => (
  <IntlProvider locale="en">
    <SettingAlert
      title={alertTitle}
      description={alertDescription}
      className={alertClassName}
    />
  </IntlProvider>
);

describe('<SettingAlert />', () => {
  it('renders the title and description correctly', () => {
    const { getByText } = render(<RootWrapper />);
    const titleElement = getByText(alertTitle);
    const descriptionElement = getByText(alertDescription);
    expect(titleElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
  });
  it('renders the alert with additional props', () => {
    const { getByRole } = render(<RootWrapper />);
    const alertElement = getByRole('alert');
    const classNameExists = alertElement.classList.contains(alertClassName);
    expect(alertElement).toBeInTheDocument();
    expect(classNameExists).toBe(true);
  });
});
