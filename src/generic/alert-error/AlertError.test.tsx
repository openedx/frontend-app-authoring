import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AlertError from '.';

const RootWrapper = ({ error }: { error: unknown }) => (
  <IntlProvider locale="en">
    <AlertError error={error} />
  </IntlProvider>
);

describe('<AlertMessage />', () => {
  test('render using a string', () => {
    const error = 'This is a string error message';
    const { getByText } = render(<RootWrapper error={error} />);
    expect(getByText('This is a string error message')).toBeInTheDocument();
  });

  test('render using an error', () => {
    const error = new Error('This is an error message');
    const { getByText } = render(<RootWrapper error={error} />);
    expect(getByText('This is an error message')).toBeInTheDocument();
  });

  test('render using an error with response', () => {
    const error = {
      message: 'This is an error message',
      response: {
        data: {
          message: 'This is a response body',
        },
      },
    };
    const { getByText } = render(<RootWrapper error={error} />);
    screen.logTestingPlaygroundURL();
    expect(getByText(/this is an error message/i)).toBeInTheDocument();
    expect(getByText(/\{"message":"this is a response body"\}/i)).toBeInTheDocument();
  });
});
