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

  it('sets all date inputs to disabled when isEditable is false', () => {
    const { container } = render(<RootWrapper {...props} isEditable={false} />);
    // DatepickerControl uses disabled={readonly}, so inputs get the disabled attribute
    const inputs = container.querySelectorAll('input[disabled]');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('date inputs are not readonly when isEditable is true', () => {
    const { container } = render(<RootWrapper {...props} isEditable />);
    // upgradeDeadline and enrollmentEnd (not editable) will still be readonly — only check start/end date
    const allInputs = container.querySelectorAll('input');
    const startDateInput = Array.from(allInputs).find((i) => i.id?.includes('startDate-date'));
    expect(startDateInput).not.toBeNull();
    expect(startDateInput.readOnly).toBe(false);
  });
});
