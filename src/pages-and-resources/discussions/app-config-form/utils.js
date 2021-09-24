import moment from 'moment';
import _ from 'lodash';
import { getIn } from 'formik';

import { blackoutDatesStatus as constants } from '../data/constants';

export const filterItemFromObject = (array, key, value) => (
  array.filter(item => item[key] !== value)
);

export const checkFieldErrors = (touched, errors, field, propertyName, index) => Boolean(
  getIn(errors, `${field}[${index}].${propertyName}`) && getIn(touched, `${field}[${index}].${propertyName}`),
);

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

export const formatDate = (date, time) => (time ? `${date}T${time}` : date);
export const isSameDay = (startDate, endDate) => moment(startDate).isSame(endDate, 'day');
export const isSameMonth = (startDate, endDate) => moment(startDate).isSame(endDate, 'month');
export const isSameYear = (startDate, endDate) => moment(startDate).isSame(endDate, 'year');

export const sortBlackoutDatesByStatus = (data, status, order) => (
  _.orderBy(data.filter(date => date.status === status),
    [(obj) => moment(formatDate(obj.startDate, obj.startTime))], [order])
);

export const formatBlackoutDates = ({
  startDate, startTime, endDate, endTime,
}) => {
  let formattedDate;
  const hasSameDay = isSameDay(startDate, endDate);
  const hasSameMonth = isSameMonth(startDate, endDate);
  const hasSameYear = isSameYear(startDate, endDate);
  const isTimeAvailable = Boolean(startTime && endTime);
  const mStartDate = moment(startDate);
  const mEndDate = moment(endDate);
  const mStartDateTime = moment(`${startDate}T${startTime}`);
  const mEndDateTime = moment(`${endDate}T${endTime}`);

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
  } else if (hasSameMonth && isTimeAvailable) {
    formattedDate = `
      ${mStartDateTime.format('MMMM D, YYYY, h:mma')} -
      ${mEndDateTime.format('MMMM D, YYYY, h:mma')}
    `;
  } else if (!hasSameMonth && hasSameYear) {
    formattedDate = `
      ${mStartDate.format('MMMM D')} -
      ${mEndDate.format('MMMM D, YYYY')}
    `;
  } else if (!hasSameMonth && !hasSameYear) {
    formattedDate = `
      ${mStartDate.format('MMMM D, YYYY')} -
      ${mEndDate.format('MMMM D, YYYY')}
    `;
  }
  return formattedDate;
};
