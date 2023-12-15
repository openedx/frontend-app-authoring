import { LAUNCH_CHECKLIST, BEST_PRACTICES_CHECKLIST } from '../constants';
import { getChecklistValues, getChecklistValidatedValue } from './getChecklistValues';

/**
 * Get status bar course launch checklist values
 * @param {object} data - course launch data
 * @returns {
 *   totalCourseLaunchChecks: {number},
 *   completedCourseLaunchChecks: {number}
 * } - total and completed launch checklist items
 */
const getCourseLaunchChecklist = (data) => {
  if (Object.keys(data).length > 0) {
    const { isSelfPaced, certificates } = data;

    const filteredCourseLaunchChecks = getChecklistValues({
      checklist: LAUNCH_CHECKLIST.data,
      isSelfPaced,
      hasCertificatesEnabled: certificates.isEnabled,
      hasHighlightsEnabled: false,
    });

    const completedCourseLaunchChecks = filteredCourseLaunchChecks.reduce((result, currentValue) => {
      const value = getChecklistValidatedValue(data, currentValue.id);
      return value ? result + 1 : result;
    }, 0);

    return {
      totalCourseLaunchChecks: filteredCourseLaunchChecks.length,
      completedCourseLaunchChecks,
    };
  }

  return {
    totalCourseLaunchChecks: 0,
    completedCourseLaunchChecks: 0,
  };
};

/**
 * Get status bar course best practices checklist values
 * @param {object} data - course best practices data
 * @returns {
 *   totalCourseBestPracticesChecks: {number},
 *   completedCourseBestPracticesChecks: {number}
 * } - total and completed launch checklist items
 */
const getCourseBestPracticesChecklist = (data) => {
  if (Object.keys(data).length > 0) {
    const { isSelfPaced, sections } = data;

    const filteredBestPracticesChecks = getChecklistValues({
      checklist: BEST_PRACTICES_CHECKLIST.data,
      isSelfPaced,
      hasCertificatesEnabled: false,
      hasHighlightsEnabled: sections.highlightsEnadled,
    });

    const completedCourseBestPracticesChecks = filteredBestPracticesChecks.reduce((result, currentValue) => {
      const value = getChecklistValidatedValue(data, currentValue.id);
      return value ? result + 1 : result;
    }, 0);

    return {
      totalCourseBestPracticesChecks: filteredBestPracticesChecks.length,
      completedCourseBestPracticesChecks,
    };
  }

  return {
    totalCourseBestPracticesChecks: 0,
    completedCourseBestPracticesChecks: 0,
  };
};

export {
  getCourseLaunchChecklist,
  getCourseBestPracticesChecklist,
};
