import React from 'react';
import { render, screen, initializeMocks } from '../../../testUtils';
import FetchErrorAlert from './FetchErrorAlert';

const message = {
  id: 'test.error',
  defaultMessage: 'Something went wrong!',
  description: 'Test error message',
};

describe('FetchErrorAlert', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the error message when isFetchError is true', () => {
    render(
      <FetchErrorAlert message={message} isFetchError />,
    );
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('does not render the error message when isFetchError is false', () => {
    render(
      <FetchErrorAlert message={message} isFetchError={false} />,
    );
    expect(screen.queryByText('Something went wrong!')).not.toBeInTheDocument();
  });

  it('renders error with a custom message', () => {
    const customMessage = {
      id: 'another.error',
      defaultMessage: 'Another error occurred.',
      description: 'Another error',
    };
    render(
      <FetchErrorAlert message={customMessage} isFetchError />,
    );
    expect(screen.getByText('Another error occurred.')).toBeInTheDocument();
  });
});
