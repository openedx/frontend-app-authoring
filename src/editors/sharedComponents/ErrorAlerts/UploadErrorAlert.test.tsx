import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import UploadErrorAlert from './UploadErrorAlert';

const errorMessage = {
  id: 'error.errorTitle',
  defaultMessage: 'Example error message',
  description: 'Title of message presented to user when something goes wrong',
};

const defaultProps = {
  isUploadError: true,
  message: errorMessage,
};

describe('UploadErrorAlert', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders the error message', () => {
    render(<UploadErrorAlert {...defaultProps} />);
    expect(screen.queryByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(errorMessage.defaultMessage)).toBeInTheDocument();
  });

  test('does not render the error message when isUploadError is false', () => {
    render(<UploadErrorAlert {...defaultProps} isUploadError={false} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(errorMessage.defaultMessage)).not.toBeInTheDocument();
  });
});
