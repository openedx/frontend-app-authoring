import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { convertToStringFromDate } from '../../utils';
import { DatepickerControl, DATEPICKER_TYPES } from '.';
import messages from './messages';
import { DATE_FORMAT } from '../../constants';

describe('<DatepickerControl />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <DatepickerControl {...props} />
    </IntlProvider>
  );

  const props = {
    type: DATEPICKER_TYPES.date,
    label: 'fooLabel',
    value: '',
    showUTC: false,
    readonly: false,
    helpText: 'barHelpText',
    isInvalid: false,
    controlName: 'fooControlName',
    onChange: onChangeMock,
  };

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it('renders without crashing', () => {
    const { getByText, queryAllByText, getByPlaceholderText } = render(
      <RootWrapper {...props} />,
    );
    expect(getByText(props.label)).toBeInTheDocument();
    expect(getByText(props.helpText)).toBeInTheDocument();
    expect(queryAllByText(messages.datepickerUTC.defaultMessage).length).toBe(0);
    expect(
      getByPlaceholderText(DATE_FORMAT.toLocaleUpperCase()),
    ).toBeInTheDocument();
  });

  it('calls onChange on datepicker input change', () => {
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    const input = getByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    fireEvent.change(input, { target: { value: '06/16/2023' } });
    expect(onChangeMock).toHaveBeenCalledWith(
      convertToStringFromDate('06/16/2023'),
    );
  });

  it('renders time picker with accessibility hint', () => {
    const { getByText, getByLabelText } = render(
      <RootWrapper
        {...props}
        type={DATEPICKER_TYPES.time}
        value="2025-01-01T10:00:00Z"
        helpText=""
      />,
    );
    expect(
      getByText('Enter time in HH:MM or twelve-hour format, for example 6:00 PM.'),
    ).toBeInTheDocument();
    expect(getByLabelText(messages.timepickerAriaLabel.defaultMessage))
      .toBeInTheDocument();
  });

  it('increments time value with arrow down and decrements with arrow up', () => {
    const incremented = convertToStringFromDate('2025-01-01T10:30:00Z');
    const decremented = convertToStringFromDate('2025-01-01T09:30:00Z');
    const { getByLabelText } = render(
      <RootWrapper
        {...props}
        type={DATEPICKER_TYPES.time}
        value="2025-01-01T10:00:00Z"
        helpText=""
      />,
    );
    const input = getByLabelText(messages.timepickerAriaLabel.defaultMessage);
    expect(input).toHaveValue('10:00');
    fireEvent.keyDown(input, { key: 'ArrowDown', target: { value: '10:00' } });
    expect(onChangeMock).toHaveBeenCalledWith(incremented);
    fireEvent.keyDown(input, { key: 'ArrowUp', target: { value: '10:30' } });
    expect(onChangeMock).toHaveBeenCalledWith(decremented);
  });

});
