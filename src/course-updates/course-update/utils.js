import moment from 'moment';

import { COMMA_SEPARATED_DATE_FORMAT } from '../../constants';

/**
 * Check is valid date format in course update
 * @param {string} date - date for update
 * @returns {boolean} - is valid date format
 */
const isDateForUpdateValid = (date) => {
  const parsedDate = moment(date, COMMA_SEPARATED_DATE_FORMAT, true);

  return parsedDate.isValid() && parsedDate.format(COMMA_SEPARATED_DATE_FORMAT) === date;
};

export { isDateForUpdateValid };
