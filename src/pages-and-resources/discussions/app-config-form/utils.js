import moment from 'moment';
import _ from 'lodash';
import { getIn } from 'formik';
import { restrictedDatesStatus as constants } from '../data/constants';

export const filterItemFromObject = (array, key, value) => (
  array.filter(item => item[key] !== value)
);

export const checkFieldErrors = (touched, errors, fieldPath, propertyName) => {
  const path = fieldPath ? `${fieldPath}.${propertyName}` : propertyName;
  return Boolean(getIn(errors, path) && getIn(touched, path));
};

export const errorExists = (errors, fieldPath, propertyName) => getIn(errors, `${fieldPath}.${propertyName}`);

export const checkStatus = ([startDate, endDate]) => {
  const today = moment(); let status;

  if (moment(endDate).isBefore(today, 'days')) {
    status = constants.COMPLETE;
  } else if (moment(startDate).isAfter(today, 'days')) {
    status = constants.UPCOMING;
  } else {
    status = constants.ACTIVE;
  }
  return status;
};

export const validTimeFormats = ['hh:mm A', 'HH:mm'];
export const mergeDateTime = (date, time) => ((date && time) ? `${date}T${time}` : date);
export const isSameDay = (startDate, endDate) => moment(startDate).isSame(endDate, 'day');
export const isSameMonth = (startDate, endDate) => moment(startDate).isSame(endDate, 'month');
export const isSameYear = (startDate, endDate) => moment(startDate).isSame(endDate, 'year');
export const getTime = (dateTime) => (dateTime ? dateTime.split('T')[1] : '');
export const hasValidDateFormat = (date) => moment(date, ['MM/DD/YYYY', 'YYYY-MM-DD'], true).isValid();
export const hasValidTimeFormat = (time) => time && moment(time, validTimeFormats, true).isValid();
export const startOfDayTime = (time) => time || moment().startOf('day').format('HH:mm');
export const endOfDayTime = (time) => time || moment().endOf('day').format('HH:mm');
export const normalizeTime = (time) => time && moment(time, validTimeFormats, true).format('HH:mm');
export const normalizeDate = (date) => moment(date, ['MM/DD/YYYY', 'YYYY-MM-DDTHH:mm', 'YYYY-MM-DD'], true).format('YYYY-MM-DD');

export const decodeDateTime = (date, time) => {
  const nDate = normalizeDate(date);
  const nTime = normalizeTime(time);

  return moment(mergeDateTime(nDate, nTime));
};

export const sortRestrictedDatesByStatus = (data, status, order) => (
  _.orderBy(
    data.filter(date => date.status === status),
    [(obj) => decodeDateTime(obj.startDate, startOfDayTime(obj.startTime))],
    [order],
  )
);

export const formatRestrictedDates = ({
  startDate, startTime, endDate, endTime,
}) => {
  let formattedDate;
  const hasSameDay = isSameDay(startDate, endDate);
  const hasSameMonth = isSameMonth(startDate, endDate);
  const hasSameYear = isSameYear(startDate, endDate);
  const isTimeAvailable = Boolean(startTime || endTime);
  const mStartDate = moment(startDate);
  const mEndDate = moment(endDate);
  const mStartDateTime = decodeDateTime(startDate, startOfDayTime(startTime));
  const mEndDateTime = decodeDateTime(endDate, endOfDayTime(endTime));

  if (hasSameDay && !isTimeAvailable) {
    formattedDate = mStartDate.format('MMMM D, YYYY');
  } else if (hasSameDay && isTimeAvailable) {
    formattedDate = `
      ${mStartDateTime.format('MMMM D, YYYY, h:mma')} -
      ${mEndDateTime.format('h:mma')}
    `;
  } else if (hasSameMonth && !isTimeAvailable) {
    formattedDate = `
      ${mStartDate.format('MMMM D')} -
      ${mEndDate.format('D, YYYY')}
    `;
  } else if (!hasSameMonth && hasSameYear && !isTimeAvailable) {
    formattedDate = `
      ${mStartDate.format('MMMM D')} -
      ${mEndDate.format('MMMM D, YYYY')}
    `;
  } else if (!hasSameMonth && !hasSameYear && !isTimeAvailable) {
    formattedDate = `
      ${mStartDate.format('MMMM D, YYYY')} -
      ${mEndDate.format('MMMM D, YYYY')}
    `;
  } else {
    formattedDate = `
      ${mStartDateTime.format('MMMM D, YYYY, h:mma')} -
      ${mEndDateTime.format('MMMM D, YYYY, h:mma')}
    `;
  }
  return formattedDate;
};
