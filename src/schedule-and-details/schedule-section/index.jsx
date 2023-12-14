import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import SectionSubHeader from '../../generic/section-sub-header';
import { ScheduleRow, SCHEDULE_ROW_TYPES } from './schedule-row';
import { CertificateDisplayRow } from './certificate-display-row';
import messages from './messages';

const ScheduleSection = ({
  endDate,
  startDate,
  errorFields,
  platformName,
  enrollmentEnd,
  enrollmentStart,
  upgradeDeadline,
  enrollmentEndEditable,
  certificateAvailableDate,
  certificatesDisplayBehavior,
  canShowCertificateAvailableDateField,
  onChange,
}) => {
  const intl = useIntl();
  const enrollmentEndHelpText = intl.formatMessage(
    messages.scheduleEnrollmentEndDateHelpText,
  );
  const enrollmentEndHelpTexRestricted = intl.formatMessage(
    messages.scheduleEnrollmentEndDateRestrictedHelpText,
    { platformName },
  );
  const computedEnrollmentEndHelpText = `${enrollmentEndHelpText} ${
    !enrollmentEndEditable ? enrollmentEndHelpTexRestricted : ''
  }`;

  const propsForScheduleFields = [
    {
      value: startDate,
      labels: [
        intl.formatMessage(messages.scheduleCourseStartDateLabel),
        intl.formatMessage(messages.scheduleCourseStartTimeLabel),
      ],
      rowType: SCHEDULE_ROW_TYPES.datetime,
      helpText: intl.formatMessage(messages.scheduleCourseStartDateHelpText),
      controlName: 'startDate',
      errorFeedback: errorFields?.startDate,
    },
    {
      labels: [
        intl.formatMessage(messages.scheduleCourseEndDateLabel),
        intl.formatMessage(messages.scheduleCourseEndTimeLabel),
      ],
      value: endDate,
      rowType: SCHEDULE_ROW_TYPES.datetime,
      helpText: intl.formatMessage(messages.scheduleCourseEndDateHelpText),
      controlName: 'endDate',
      errorFeedback: errorFields?.endDate,
    },
    {
      skip: !canShowCertificateAvailableDateField,
      key: 'certificate-display-row',
      rowType: SCHEDULE_ROW_TYPES.dropdown,
      certificateAvailableDate,
      availableDateErrorFeedback: errorFields?.certificateAvailableDate,
      certificatesDisplayBehavior,
      displayBehaviorErrorFeedback: errorFields?.certificatesDisplayBehavior,
    },
    {
      labels: [
        intl.formatMessage(messages.scheduleEnrollmentStartDateLabel),
        intl.formatMessage(messages.scheduleEnrollmentStartTimeLabel),
      ],
      value: enrollmentStart,
      rowType: SCHEDULE_ROW_TYPES.datetime,
      helpText: intl.formatMessage(messages.scheduleEnrollmentStartDateHelpText),
      controlName: 'enrollmentStart',
      errorFeedback: errorFields?.enrollmentStart,
    },
    {
      labels: [
        intl.formatMessage(messages.scheduleEnrollmentEndDateLabel),
        intl.formatMessage(messages.scheduleEnrollmentEndTimeLabel),
      ],
      value: enrollmentEnd,
      rowType: SCHEDULE_ROW_TYPES.datetime,
      helpText: computedEnrollmentEndHelpText,
      readonly: !enrollmentEndEditable,
      controlName: 'enrollmentEnd',
      errorFeedback: errorFields?.enrollmentEnd,
    },
    {
      skip: !upgradeDeadline,
      labels: [
        intl.formatMessage(messages.scheduleUpgradeDeadlineDateLabel),
        intl.formatMessage(messages.scheduleUpgradeDeadlineTimeLabel),
      ],
      value: upgradeDeadline,
      rowType: SCHEDULE_ROW_TYPES.datetime,
      helpText: intl.formatMessage(
        messages.scheduleUpgradeDeadlineDateHelpText,
        {
          platformName,
        },
      ),
      readonly: true,
      controlName: 'upgradeDeadline',
      errorFeedback: errorFields?.upgradeDeadline,
    },
  ];

  return (
    <section className="section-container schedule-section" id="schedule">
      <SectionSubHeader
        title={intl.formatMessage(messages.scheduleTitle)}
        description={intl.formatMessage(messages.scheduleDescription)}
      />
      <ul className="schedule-date-list">
        {propsForScheduleFields
          .filter((field) => !field.skip)
          .map((fieldProps) => {
            if (fieldProps.rowType === SCHEDULE_ROW_TYPES.datetime) {
              const { skip, rowType, ...restProps } = fieldProps;
              return (
                <ScheduleRow
                  {...restProps}
                  key={fieldProps.controlName}
                  onChange={onChange}
                />
              );
            }
            const { rowType, key, ...restProps } = fieldProps;
            return (
              <CertificateDisplayRow
                {...restProps}
                key={key}
                onChange={onChange}
              />
            );
          })}
      </ul>
    </section>
  );
};

ScheduleSection.defaultProps = {
  endDate: '',
  startDate: '',
  errorFields: {},
  enrollmentEnd: '',
  enrollmentStart: '',
  upgradeDeadline: '',
  certificateAvailableDate: '',
};

ScheduleSection.propTypes = {
  endDate: PropTypes.string,
  startDate: PropTypes.string,
  errorFields: PropTypes.objectOf(PropTypes.string),
  platformName: PropTypes.string.isRequired,
  enrollmentEnd: PropTypes.string,
  enrollmentStart: PropTypes.string,
  upgradeDeadline: PropTypes.string,
  enrollmentEndEditable: PropTypes.bool.isRequired,
  certificateAvailableDate: PropTypes.string,
  certificatesDisplayBehavior: PropTypes.string.isRequired,
  canShowCertificateAvailableDateField: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ScheduleSection;
