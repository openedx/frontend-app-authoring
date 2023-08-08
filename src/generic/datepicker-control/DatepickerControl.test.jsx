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
    intl: {},
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
});
