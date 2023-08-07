import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { courseDetailsMock, courseSettingsMock } from '../__mocks__';
import messages from './messages';
import certificateMessages from './certificate-display-row/messages';
import ScheduleSection from '.';

describe('<ScheduleSection />', () => {
  const onChangeMock = jest.fn();
  const RootWrapper = (props) => (
    <IntlProvider locale="en">
      <ScheduleSection {...props} />
    </IntlProvider>
  );

  const {
    platformName,
    upgradeDeadline,
    enrollmentEndEditable,
    canShowCertificateAvailableDateField,
  } = courseSettingsMock;

  const {
    endDate,
    startDate,
    enrollmentEnd,
    enrollmentStart,
    certificateAvailableDate,
    certificatesDisplayBehavior,
  } = courseDetailsMock;

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
    canShowCertificateAvailableDateField,
    onChange: onChangeMock,
  };

  it('renders schedule section successfully', () => {
    const { getByText, queryAllByText } = render(<RootWrapper {...props} />);
    expect(getByText(messages.scheduleTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleCourseStartDateLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleCourseStartTimeLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleCourseEndDateLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleCourseEndTimeLabel.defaultMessage)).toBeInTheDocument();
    expect(queryAllByText(certificateMessages.certificateBehaviorLabel.defaultMessage).length).toBe(0);
    expect(queryAllByText(certificateMessages.certificateAvailableDateLabel.defaultMessage).length).toBe(0);
    expect(getByText(messages.scheduleEnrollmentStartDateLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleEnrollmentStartTimeLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleEnrollmentEndDateLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleEnrollmentEndTimeLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleUpgradeDeadlineDateLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.scheduleUpgradeDeadlineTimeLabel.defaultMessage)).toBeInTheDocument();
  });

  it('renders certificate behavior with condition', () => {
    const initialProps = { ...props, canShowCertificateAvailableDateField: true };
    const { getByText, queryAllByText } = render(<RootWrapper {...initialProps} />);
    expect(getByText(certificateMessages.certificateBehaviorLabel.defaultMessage)).toBeInTheDocument();
    expect(queryAllByText(certificateMessages.certificateAvailableDateLabel.defaultMessage).length).toBe(0);
  });
});
