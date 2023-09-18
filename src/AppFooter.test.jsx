import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AppFooter from './AppFooter';

describe('<AppFooter />', () => {
  const RootWrapper = () => (
    <IntlProvider locale="en">
      <AppFooter />
    </IntlProvider>
  );
  it('should render the footer successfully', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Looking for help with Studio?')).toBeInTheDocument();
    expect(getByText('LMS')).toHaveAttribute('href', process.env.LMS_BASE_URL);
  });
});
