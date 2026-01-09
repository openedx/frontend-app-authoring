import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AlertError from '.';

const RootWrapper = ({ error, showErrorBody = true }: { error: unknown, showErrorBody?: boolean }) => (
  <IntlProvider locale="en">
    <AlertError error={error} showErrorBody={showErrorBody} />
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
    expect(getByText(/this is an error message/i)).toBeInTheDocument();
    expect(getByText(/\{ "message": "this is a response body" \}/i)).toBeInTheDocument();
  });

  test('hides error body when requested', () => {
    const error = new Error('Hidden body');
    const { queryByText } = render(<RootWrapper error={error} showErrorBody={false} />);
    expect(queryByText(/Hidden body/i)).not.toBeInTheDocument();
  });
});
