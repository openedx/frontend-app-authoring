import { createCorrectInternalRoute } from '../utils';

/**
 * Adapts API URL paths to the application's internal URL format based on predefined conditions.
 *
 * @param {Object} params - Parameters for URL adaptation.
 * @param {string} params.url - The original API URL to transform.
 * @param {string} params.courseId - The course ID.
 * @param {string} params.sequenceId - The sequence ID.
 * @returns {string} - A correctly formatted internal route for the application.
 */
// eslint-disable-next-line import/prefer-default-export
export const adoptCourseSectionUrl = (
  { url, courseId, sequenceId }: { url: string, courseId: string, sequenceId: string },
): string => {
  let newUrl = url;
  const urlConditions = [
    {
      regex: /^\/container\/(.+)/,
      transform: ([, unitId]) => `/course/${courseId}/container/${unitId}/${sequenceId}`,
    },
  ];

  for (const { regex, transform } of urlConditions) {
    const match = RegExp(regex).exec(url);
    if (match) {
      newUrl = transform([match[0], match[1]]);
      break;
    }
  }

  return createCorrectInternalRoute(newUrl);
};
