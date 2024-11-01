import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import TagCount from '.';

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <TagCount {...props} />,
  </IntlProvider>,
);

describe('<TagCount>', () => {
  it('should render the component', () => {
    renderComponent({ count: 17 });
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('should render the component with zero', () => {
    renderComponent({ count: 0 });
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render a button with onClick', () => {
    renderComponent({ count: 17, onClick: () => {} });
    expect(screen.getByRole('button', {
      name: /17/i,
    }));
  });
});
