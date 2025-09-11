import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import * as Yup from 'yup';
import { snakeCase } from 'lodash/string';
import moment from 'moment-timezone';
import { getConfig, getPath } from '@edx/frontend-platform';

import { RequestStatus } from './data/constants';
import { getCourseAppSettingValue, getLoadingStatus } from './pages-and-resources/data/selectors';
import { fetchCourseAppSettings, updateCourseAppSetting } from './pages-and-resources/data/thunks';
import { PagesAndResourcesContext } from './pages-and-resources/PagesAndResourcesProvider';
import {
  hasValidDateFormat, hasValidTimeFormat, decodeDateTime, endOfDayTime, startOfDayTime,
} from './pages-and-resources/discussions/app-config-form/utils';
import { DATE_TIME_FORMAT } from './constants';

export const executeThunk = async (thunk, dispatch, getState) => {
  await thunk(dispatch, getState);
  await new Promise(setImmediate);
};

export function useIsMobile() {
  return useMediaQuery({ query: '(max-width: 767.98px)' });
}

export function useIsDesktop() {
  return useMediaQuery({ query: '(min-width: 992px)' });
}

export function convertObjectToSnakeCase(obj, unpacked = false) {
  return Object.keys(obj).reduce((snakeCaseObj, key) => {
    const snakeCaseKey = snakeCase(key);
    const value = unpacked ? obj[key] : { value: obj[key] };
    return {
      ...snakeCaseObj,
      [snakeCaseKey]: value,
    };
  }, {});
}

export function deepConvertingKeysToCamelCase(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepConvertingKeysToCamelCase(item));
  }

  const camelCaseObj = {};
  Object.keys(obj).forEach((key) => {
    const camelCaseKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
    camelCaseObj[camelCaseKey] = deepConvertingKeysToCamelCase(obj[key]);
  });
  return camelCaseObj;
}

export function deepConvertingKeysToSnakeCase(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepConvertingKeysToSnakeCase(item));
  }

  const snakeCaseObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    const snakeCaseKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    snakeCaseObj[snakeCaseKey] = key === 'gradeCutoffs' ? value : deepConvertingKeysToSnakeCase(value);
  });
  return snakeCaseObj;
}

export function transformKeysToCamelCase(obj) {
  return obj.key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

export function parseArrayOrObjectValues(obj) {
  const result = {};

  Object.entries(obj).forEach(([key, value]) => {
    try {
      if (!Number.isNaN(Number(value))) {
        result[key] = value;
      } else {
        result[key] = JSON.parse(value);
      }
    } catch (e) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * Create a correct inner path depend on config PUBLIC_PATH.
 * @param {string} checkPath - the internal route path that is validated
 * @returns {string} - the correct internal route path
 */
export const createCorrectInternalRoute = (checkPath) => {
  // let basePath = getPath(getConfig().PUBLIC_PATH);

  // if (basePath.endsWith('/')) {
  //   basePath = basePath.slice(0, -1);
  // }

  // if (!checkPath.startsWith(basePath)) {
  //   return `${basePath}${checkPath}`;
  // }

  return checkPath;
};

export function getPagePath(courseId, isMfePageEnabled, urlParameter) {
  if (isMfePageEnabled === 'true') {
    if (urlParameter === 'tabs') {
      return createCorrectInternalRoute(`/course/${courseId}/pages-and-resources`);
    }
    return createCorrectInternalRoute(`/course/${courseId}/${urlParameter}`);
  }
  return `${getConfig().STUDIO_BASE_URL}/${urlParameter}/${courseId}`;
}

export function useAppSetting(settingName) {
  const dispatch = useDispatch();
  const { courseId } = useContext(PagesAndResourcesContext);
  const settingValue = useSelector(getCourseAppSettingValue(settingName));
  const loadingStatus = useSelector(getLoadingStatus);
  useEffect(() => {
    if ([RequestStatus.DENIED, RequestStatus.FAILED].includes(loadingStatus)) {
      return;
    }
    if (settingValue === undefined || settingValue === null) {
      dispatch(fetchCourseAppSettings(courseId, [settingName]));
    }
  }, [courseId]);

  const saveSetting = async (value) => dispatch(updateCourseAppSetting(courseId, settingName, value));
  return [settingValue, saveSetting];
}

export const getLabelById = (options, id) => {
  const foundOption = options.find((option) => option.id === id);
  return foundOption ? foundOption.label : '';
};

/**
 * Adds additional validation methods to Yup.
 */
export function setupYupExtensions() {
  Yup.addMethod(Yup.array, 'uniqueProperty', function uniqueProperty(property, message) {
    return this.test('unique', '', function testUniqueness(list) {
      const errors = [];

      list.forEach((item, index) => {
        const propertyValue = item[property];

        if (propertyValue && list.filter(entry => entry[property] === propertyValue).length > 1) {
          errors.push(
            this.createError({
              path: `${this.path}[${index}].${property}`,
              message,
            }),
          );
        }
      });

      if (errors.length > 0) {
        throw new Yup.ValidationError(errors);
      }

      return true;
    });
  });

  Yup.addMethod(Yup.object, 'uniqueObjectProperty', function uniqueObjectProperty(propertyName, message) {
    return this.test('unique', message, function testUniqueness(discussionTopic) {
      if (!discussionTopic || !discussionTopic[propertyName]) {
        return true;
      }
      const isDuplicate = this.parent.filter(topic => topic !== discussionTopic)
        .some(topic => topic[propertyName]?.toLowerCase() === discussionTopic[propertyName].toLowerCase());

      if (isDuplicate) {
        throw this.createError({
          path: `${this.path}.${propertyName}`,
          error: message,
        });
      }
      return true;
    });
  });

  Yup.addMethod(Yup.string, 'compare', function compare(message, type) {
    return this.test('isGreater', message, function isGreater() {
      if (!this.parent
        || (!(this.parent.startTime && this.parent.endTime) && type === 'time')
        || (!(this.parent.startDate && this.parent.endDate) && type === 'date')
      ) {
        return true;
      }

      const startDateTime = decodeDateTime(this.parent.startDate, startOfDayTime(this.parent.startTime));
      const endDateTime = decodeDateTime(this.parent.endDate, endOfDayTime(this.parent.endTime));
      let isInvalidStartDateTime;

      if (type === 'date') {
        isInvalidStartDateTime = startDateTime.isAfter(endDateTime);
      } else if (type === 'time') {
        isInvalidStartDateTime = startDateTime.isSameOrAfter(endDateTime);
      }

      if (isInvalidStartDateTime) {
        throw this.createError({
          path: `${this.path}`,
          error: message,
        });
      }
      return true;
    });
  });

  Yup.addMethod(Yup.string, 'checkFormat', function checkFormat(message, type) {
    return this.test('isValidFormat', message, function isValidFormat() {
      if (!this.originalValue) {
        return true;
      }
      let isValid;

      if (type === 'date') {
        isValid = hasValidDateFormat(this.originalValue);
      } else if (type === 'time') {
        isValid = hasValidTimeFormat(this.originalValue);
      }

      if (!isValid) {
        throw this.createError({
          path: `${this.path}`,
          error: message,
        });
      }
      return true;
    });
  });
}

export const convertToDateFromString = (dateStr) => {
  /**
   * Convert UTC to local time for react-datepicker
   * @param {string} dateStr - YYYY-MM-DDTHH:MM:SSZ
   * @return {Date} date in local time based on the user's browser time zone
   */
  if (!dateStr) {
    return '';
  }

  return moment(dateStr).local().toDate();
};

export const convertToStringFromDate = (date) => {
  /**
   * Convert local time to UTC from react-datepicker
   * @param {Date} date - date in local time
   * @return {string} YYYY-MM-DDTHH:MM:SSZ
   */
  if (!date) {
    return '';
  }

  return moment(date).utc().format('YYYY-MM-DDTHH:mm:ssZ'); // Convert to UTC before formatting
};

export const convertToLocalTime = (releaseDate) => {
  if (!releaseDate) {
    console.error('Invalid date: No release date provided');
    return 'Invalid date';
  }

  const localDate = moment.utc(releaseDate, 'MMM DD, YYYY at HH:mm UTC', true);

  if (!localDate.isValid()) {
    console.error('Invalid date format:', releaseDate);
    return 'Invalid date';
  }

  const timezoneName = moment.tz.guess();
  const normalizedTimezone = timezoneName === 'Asia/Calcutta' ? 'Asia/Kolkata' : timezoneName;
  const formattedDate = localDate.local().format('MMM DD, YYYY [at] hh:mm A');
  const timezoneOffset = localDate.local().format('Z');

  // Adjust the return format to match your desired output
  return `${formattedDate} (${normalizedTimezone} GMT${timezoneOffset})`;
};

export const isValidDate = (date) => {
  /**
   * Validate if the date is a valid date format
   * @param {Date | string} date - date to check
   * @return {boolean} true if valid date, false otherwise
   */
  return moment(date, DATE_TIME_FORMAT, true).isValid();  // Using Moment's .isValid() for proper validation
};

export const getFileSizeToClosestByte = (fileSize) => {
  let divides = 0;
  let size = fileSize;
  while (size > 1000 && divides < 4) {
    size /= 1000;
    divides += 1;
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const fileSizeFixedDecimal = Number.parseFloat(size).toFixed(2);
  return `${fileSizeFixedDecimal} ${units[divides]}`;
};
