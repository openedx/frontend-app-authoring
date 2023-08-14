import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import DeadlineSection from '.';
import messages from './messages';

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
      gracePeriod={gracePeriodDefaultTime}
      setGradingData={jest.fn()}
      setShowSuccessAlert={jest.fn()}
      {...props}
    />
  </IntlProvider>
);

describe('<DeadlineSection />', () => {
  it('checking deadline label and description text', async () => {
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByText(messages.gracePeriodOnDeadlineLabel.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.gracePeriodOnDeadlineDescription.defaultMessage)).toBeInTheDocument();
    });
  });
  it('checking deadline input value', async () => {
    const { getByTestId } = render(<RootWrapper setGradingData={setGradingData} />);
    await waitFor(() => {
      const inputElement = getByTestId('deadline-period-input');
      expect(inputElement.value).toBe('12:12');
      fireEvent.change(inputElement, { target: { value: '13:13' } });
      expect(testObj.gracePeriod.hours).toBe(13);
      expect(testObj.gracePeriod.minutes).toBe(13);
    });
  });
});
