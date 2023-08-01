import moment from 'moment';

import { CERTIFICATE_DISPLAY_BEHAVIOR } from './schedule-section/certificate-display-row';
import messages from './messages';

const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss\\Z';

const convertToDateFromString = (dateStr) => {
  if (!dateStr) {
    return '';
  }

  return moment(dateStr).utc().toDate();
};

const isDateBeforeOrEqual = (
  dateFormer,
  dateLatter,
  allowEqual = false,
  checkExists = true,
) => {
  if (checkExists && (!dateFormer || !dateLatter)) {
    return false;
  }
  if (allowEqual) {
    return new Date(dateFormer) < new Date(dateLatter);
  }

  return new Date(dateFormer) <= new Date(dateLatter);
};

const convertToStringFromDate = (date) => {
  if (!date) {
    return '';
  }

  return moment(date).utc().format(DATE_TIME_FORMAT);
};

const validateScheduleAndDetails = (courseDetails, intl) => {
  const errors = {};
  const {
    endDate,
    startDate,
    enrollmentEnd,
    enrollmentStart,
    certificateAvailableDate,
    entranceExamMinimumScorePct,
    certificatesDisplayBehavior,
  } = courseDetails;

  if (!startDate) {
    errors.startDate = intl.formatMessage(messages.errorMessage7);
  }

  if (isDateBeforeOrEqual(certificateAvailableDate, endDate)) {
    errors.certificateAvailableDate = intl.formatMessage(messages.errorMessage6);
  }

  if (isDateBeforeOrEqual(endDate, startDate)) {
    errors.endDate = intl.formatMessage(messages.errorMessage5);
  }

  if (isDateBeforeOrEqual(startDate, enrollmentStart, true)) {
    errors.enrollmentStart = intl.formatMessage(messages.errorMessage4);
  }

  if (isDateBeforeOrEqual(enrollmentEnd, enrollmentStart)) {
    errors.enrollmentStart = intl.formatMessage(messages.errorMessage3);
  }

  if (isDateBeforeOrEqual(endDate, enrollmentEnd, true)) {
    errors.enrollmentEnd = intl.formatMessage(messages.errorMessage2);
  }

  if (
    certificatesDisplayBehavior === CERTIFICATE_DISPLAY_BEHAVIOR.endWithDate
    && !certificateAvailableDate
  ) {
    errors.certificateAvailableDate = intl.formatMessage(messages.errorMessage1);
  }

  if (entranceExamMinimumScorePct) {
    const number = Number(entranceExamMinimumScorePct);
    if (Number.isNaN(number) || number < 1 || number > 100) {
      errors.entranceExamMinimumScorePct = intl.formatMessage(messages.errorMessage8);
    }
  }

  return errors;
};

export {
  validateScheduleAndDetails,
  convertToDateFromString,
  convertToStringFromDate,
};
