import React from 'react';
import { render } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import { courseDetails, courseSettings } from '../__mocks__';
import ScheduleSection from '.';

describe('<ScheduleSection />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <ScheduleSection {...props} />
    </IntlProvider>
  );

  const { platformName, upgradeDeadline, enrollmentEndEditable } = courseSettings;

  const {
    endDate,
    startDate,
    enrollmentEnd,
    enrollmentStart,
    certificateAvailableDate,
    certificatesDisplayBehavior,
  } = courseDetails;

  const props = {
    intl: {},
    endDate,
    startDate,
    errorFields: {},
    platformName,
    enrollmentEnd,
    enrollmentStart,
    upgradeDeadline,
    enrollmentEndEditable,
    certificateAvailableDate,
    certificatesDisplayBehavior,
    onChange: onChangeMock,
  };

  it('renders schedule section successfully', () => {
    const { getByText, queryAllByText } = render(<RootWrapper {...props} />);
    expect(getByText(/Course schedule/i));
    expect(
      getByText(/Dates that control when your course can be viewed/i),
    ).toBeInTheDocument();
    expect(getByText(/Course start date/i)).toBeInTheDocument();
    expect(getByText(/Course start time/i)).toBeInTheDocument();
    expect(getByText(/Course end date/i)).toBeInTheDocument();
    expect(getByText(/Course end time/i)).toBeInTheDocument();
    expect(getByText(/Certificate display behavior/i)).toBeInTheDocument();
    expect(queryAllByText('Certificate Available Date').length).toBe(0);
    expect(queryAllByText(/Enrollment start date/i).length).toBe(2);
    expect(getByText(/Enrollment start time/i)).toBeInTheDocument();
    expect(getByText(/Enrollment end date/i)).toBeInTheDocument();
    expect(getByText(/Enrollment end time/i)).toBeInTheDocument();
    expect(getByText(/Upgrade deadline date/i)).toBeInTheDocument();
    expect(getByText(/Upgrade deadline time/i)).toBeInTheDocument();
  });
});
