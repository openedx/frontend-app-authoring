import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CreditSection from '.';
import messages from './messages';

const testObj = {};
const setGradingData = (fn) => {
  testObj.minimumGradeCredit = fn({}).minimumGradeCredit;
};

const RootWrapper = (props = {}) => (
  <IntlProvider locale="en">
    <CreditSection
      eligibleGrade={0.1}
      setShowSavePrompt={jest.fn()}
      minimumGradeCredit={0.1}
      setGradingData={jest.fn()}
      setShowSuccessAlert={jest.fn()}
      {...props}
    />
  </IntlProvider>
);

describe('<CreditSection />', () => {
  it('checking credit eligibility label and description text', async () => {
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByText(messages.creditEligibilityLabel.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.creditEligibilityDescription.defaultMessage)).toBeInTheDocument();
    });
  });
  it('checking credit eligibility value', async () => {
    const { getByTestId } = render(<RootWrapper setGradingData={setGradingData} />);
    await waitFor(() => {
      const inputElement = getByTestId('minimum-grade-credit-input');
      expect(inputElement.value).toBe('10');
      fireEvent.change(inputElement, { target: { value: '2' } });
      expect(testObj.minimumGradeCredit).toBe(0.02);
    });
  });
});
