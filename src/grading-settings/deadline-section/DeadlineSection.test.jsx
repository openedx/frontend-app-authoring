import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { DEFAULT_TIME_STAMP, TIME_FORMAT } from '../../constants';
import messages from './messages';
import DeadlineSection from '.';

const testObj = {};

const setGradingData = (fn) => {
  testObj.gracePeriod = fn({}).gracePeriod;
};

const gracePeriodDefaultTime = {
  hours: 12, minutes: 12,
};

const RootWrapper = (props = {}) => (
  <IntlProvider locale="en">
    <DeadlineSection
      setShowSavePrompt={jest.fn()}
      setGradingData={jest.fn()}
      setShowSuccessAlert={jest.fn()}
      {...props}
    />
  </IntlProvider>
);

describe('<DeadlineSection />', () => {
  it('checking deadline label and description text', async () => {
    const { getByText } = render(<RootWrapper gracePeriod={gracePeriodDefaultTime} />);
    await waitFor(() => {
      expect(getByText(messages.gracePeriodOnDeadlineLabel.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.gracePeriodOnDeadlineDescription.defaultMessage)).toBeInTheDocument();
    });
  });
  it('checking deadline input value', async () => {
    const { getByTestId } = render(<RootWrapper
      gracePeriod={gracePeriodDefaultTime}
      setGradingData={setGradingData}
    />);
    await waitFor(() => {
      const inputElement = getByTestId('deadline-period-input');
      expect(inputElement.value).toBe('12:12');
      fireEvent.change(inputElement, { target: { value: '13:13' } });
      expect(testObj.gracePeriod.hours).toBe(13);
      expect(testObj.gracePeriod.minutes).toBe(13);
    });
  });
  it('checking deadline input value if grace Period has no hours', async () => {
    const { getByTestId } = render(<RootWrapper
      gracePeriod={{ hours: 0, minutes: 13 }}
      setGradingData={setGradingData}
    />);
    await waitFor(() => {
      const inputElement = getByTestId('deadline-period-input');
      expect(inputElement.value).toBe('00:13');
    });
  });
  it('checking deadline input value if grace Period has no minutes', async () => {
    const { getByTestId } = render(<RootWrapper
      gracePeriod={{ hours: 13, minutes: 0 }}
      setGradingData={setGradingData}
    />);
    await waitFor(() => {
      const inputElement = getByTestId('deadline-period-input');
      expect(inputElement.value).toBe('13:00');
    });
  });
  it('checking deadline input value if grace Period equal null', async () => {
    const { getByTestId } = render(<RootWrapper gracePeriod={null} setGradingData={setGradingData} />);
    await waitFor(() => {
      const inputElement = getByTestId('deadline-period-input');
      expect(inputElement.value).toBe(DEFAULT_TIME_STAMP);
    });
  });
  it('checking deadline input validation error', async () => {
    const { getByPlaceholderText, getByText } = render(<RootWrapper
      gracePeriod={gracePeriodDefaultTime}
      setGradingData={setGradingData}
    />);
    await waitFor(() => {
      const inputElement = getByPlaceholderText(TIME_FORMAT.toUpperCase());
      fireEvent.change(inputElement, { target: { value: 'wrong:input format' } });
      expect(getByText(`Grace period must be specified in ${TIME_FORMAT.toUpperCase()} format.`)).toBeInTheDocument();
    });
  });
  it('checking deadline input time format validation error', async () => {
    const { getByPlaceholderText, getByText } = render(<RootWrapper
      gracePeriod={gracePeriodDefaultTime}
      setGradingData={setGradingData}
    />);

    await waitFor(() => {
      const inputElement = getByPlaceholderText(TIME_FORMAT.toUpperCase());
      fireEvent.change(inputElement, { target: { value: '32:70' } });
      expect(getByText(`Grace period must be specified in ${TIME_FORMAT.toUpperCase()} format.`)).toBeInTheDocument();
    });
  });
});
