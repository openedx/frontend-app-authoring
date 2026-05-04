import React from 'react';
import { render, screen } from '@testing-library/react';

import { API_ERROR_TYPES } from '../constants';
import { buildApiErrorMessages } from './buildApiErrorMessages';
import messages from './messages';

const intl = {
  formatMessage: (message) => message.defaultMessage,
};

describe('buildApiErrorMessages', () => {
  it('maps error payloads to alert messages', () => {
    const result = buildApiErrorMessages({
      intl,
      errors: {
        outlineIndexApi: { data: 'some error', type: API_ERROR_TYPES.serverError },
        courseLaunchApi: { type: API_ERROR_TYPES.networkError },
        reindexApi: { type: API_ERROR_TYPES.unknown, data: 'some unknown error' },
      },
    });

    expect(result).toHaveLength(3);
    expect(result.map(({ title }) => title)).toEqual([
      messages.serverErrorAlert.defaultMessage,
      messages.networkErrorAlert.defaultMessage,
      'some unknown error',
    ]);

    render(<>{result[0].desc}</>);
    expect(screen.getByText('some error')).toBeInTheDocument();
  });

  it('deduplicates alerts by title', () => {
    const result = buildApiErrorMessages({
      intl,
      errors: {
        outlineIndexApi: { data: 'first server error', type: API_ERROR_TYPES.serverError },
        reindexApi: { data: 'second server error', type: API_ERROR_TYPES.serverError },
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe(messages.serverErrorAlert.defaultMessage);
  });

  it('ignores null errors', () => {
    const result = buildApiErrorMessages({
      intl,
      errors: {
        outlineIndexApi: null,
        courseLaunchApi: { type: API_ERROR_TYPES.networkError },
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe(messages.networkErrorAlert.defaultMessage);
  });
});
