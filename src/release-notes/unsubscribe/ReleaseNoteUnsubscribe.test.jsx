import React from 'react';
import {
  render, screen, fireEvent, initializeMocks, waitFor,
} from '../../testUtils';

import ReleaseNoteUnsubscribe from './ReleaseNoteUnsubscribe';
import messages from './messages';
import * as api from '../data/api';

describe('ReleaseNoteUnsubscribe', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders the idle confirmation state', () => {
    render(<ReleaseNoteUnsubscribe />);
    expect(screen.getByText(messages.unsubscribeTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.unsubscribeConfirmation.defaultMessage)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: messages.unsubscribeButton.defaultMessage }),
    ).toBeInTheDocument();
  });

  test('calls unsubscribeFromReleaseNoteEmails and shows success state on success', async () => {
    const spy = jest.spyOn(api, 'unsubscribeFromReleaseNoteEmails').mockResolvedValue({ message: 'ok' });
    render(<ReleaseNoteUnsubscribe />);

    fireEvent.click(screen.getByRole('button', { name: messages.unsubscribeButton.defaultMessage }));

    await waitFor(() => {
      expect(screen.getByText(messages.unsubscribeSuccessTitle.defaultMessage)).toBeInTheDocument();
    });
    expect(spy).toHaveBeenCalledWith();
  });

  test('shows error state and allows retry on failure', async () => {
    const spy = jest.spyOn(api, 'unsubscribeFromReleaseNoteEmails').mockRejectedValue(new Error('boom'));
    render(<ReleaseNoteUnsubscribe />);

    fireEvent.click(screen.getByRole('button', { name: messages.unsubscribeButton.defaultMessage }));

    await waitFor(() => {
      expect(screen.getByText(messages.unsubscribeErrorTitle.defaultMessage)).toBeInTheDocument();
    });
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockResolvedValueOnce({ message: 'ok' });
    fireEvent.click(screen.getByRole('button', { name: messages.unsubscribeRetry.defaultMessage }));

    await waitFor(() => {
      expect(screen.getByText(messages.unsubscribeSuccessTitle.defaultMessage)).toBeInTheDocument();
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
