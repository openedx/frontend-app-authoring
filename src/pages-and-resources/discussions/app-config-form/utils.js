import moment from 'moment';
import _ from 'lodash';

import { blackoutDatesStatus as constants } from '../data/constants';

export const filterItemFromObject = (array, key, value) => (
  array.filter(item => item[key] !== value)
);

export const checkFieldErrors = (touched, errors, field, propertyName, index) => Boolean(
  touched[field] && touched[field][index] && touched[field][index][propertyName]
  && errors[field] && errors[field][index] && errors[field][index][propertyName],
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

  if (hasSameDay && !isTimeAvailable) {
    formattedDate = moment(startDate).format('MMMM D, YYYY');
  } else if (hasSameDay && isTimeAvailable) {
    formattedDate = `${moment(`${startDate}T${startTime}`).format('MMMM D, YYYY, h:mma')} -
        ${moment(`${endDate}T${endTime}`).format('h:mma')}`;
  } else if (hasSameMonth && !isTimeAvailable) {
    formattedDate = `${moment(startDate).format('MMMM D')} -
        ${moment(endDate).format('D, YYYY')}`;
  } else if (hasSameMonth && isTimeAvailable) {
    formattedDate = `${moment(`${startDate}T${startTime}`).format('MMMM D, YYYY, h:mma')} -
        ${moment(`${endDate}T${endTime}`).format('MMMM D, YYYY, h:mma')}`;
  } else if (!hasSameMonth && hasSameYear) {
    formattedDate = `${moment(startDate).format('MMMM D')} -
        ${moment(endDate).format('MMMM D, YYYY')}`;
  } else if (!hasSameMonth && !hasSameYear) {
    formattedDate = `${moment(startDate).format('MMMM D, YYYY')} -
        ${moment(endDate).format('MMMM D, YYYY')}`;
  }
  return formattedDate;
};
