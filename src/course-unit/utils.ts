/**
 * Adapts API URL paths to the application's internal URL format based on predefined conditions.
 *
 * @param {Object} params - Parameters for URL adaptation.
 * @param {string} params.url - The original API URL to transform.
 * @param {string} params.courseId - The course ID.
 * @param {string} params.parentUnitId - The sequence ID.
 * @returns {string} - A correctly formatted internal route for the application.
 */
export const adoptCourseSectionUrl = (
  { url, courseId, parentUnitId }: { url: string, courseId: string, parentUnitId: string },
): string => {
  let newUrl = url;
  const urlConditions = [
    {
      regex: /^\/container\/(.+)/,
      transform: (unitId: string) => `/course/${courseId}/container/${unitId}/${parentUnitId}`,
    },
  ];

  for (const { regex, transform } of urlConditions) {
    const match = regex.exec(url);
    if (match?.[1]) {
      newUrl = transform(match[1]);
      break;
    }
  }

  return newUrl;
};
