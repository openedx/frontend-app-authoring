import React from 'react';
import {
  render, fireEvent, act, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock } from '../../__mocks__';
import scheduleMessage from '../../messages';
import messages from './messages';
import GradeRequirements from '.';

const onChangeMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <GradeRequirements {...props} />
  </IntlProvider>
);

const props = {
  errorEffort: '',
  entranceExamMinimumScorePct: courseDetailsMock.entranceExamMinimumScorePct,
  onChange: onChangeMock,
};

describe('<GradeRequirements />', () => {
  it('renders successfully', () => {
    const { getByText, getByDisplayValue } = render(<RootWrapper {...props} />);
    expect(getByText(messages.requirementsEntranceCollapseLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.requirementsEntranceCollapseHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByDisplayValue(props.entranceExamMinimumScorePct)).toBeInTheDocument();
  });

  it('should call onChange on input change', () => {
    const { getByDisplayValue } = render(<RootWrapper {...props} />);
    const input = getByDisplayValue(props.entranceExamMinimumScorePct);
    act(() => {
      fireEvent.change(input, { target: { valueAsNumber: '31' } });
    });
    expect(props.onChange).toHaveBeenCalledWith('31', 'entranceExamMinimumScorePct');
  });

  it('should show feedback error', () => {
    const { getByDisplayValue, getByText } = render(<RootWrapper {...props} />);
    const input = getByDisplayValue(props.entranceExamMinimumScorePct);
    act(() => {
      fireEvent.change(input, { target: { valueAsNumber: '123' } });
    });
    waitFor(() => {
      expect(getByText(scheduleMessage.errorMessage8.defaultMessage)).toBeInTheDocument();
    });
  });
});
