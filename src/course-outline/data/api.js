// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getCourseOutlineIndexApiUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/course_index/${courseId}`;

export const getCourseBestPracticesApiUrl = ({
  courseId,
  excludeGraded,
  all,
}) => `${getApiBaseUrl()}/api/courses/v1/quality/${courseId}/?exclude_graded=${excludeGraded}&all=${all}`;

export const getCourseLaunchApiUrl = ({
  courseId,
  gradedOnly,
  validateOras,
  all,
}) => `${getApiBaseUrl()}/api/courses/v1/validation/${courseId}/?graded_only=${gradedOnly}&validate_oras=${validateOras}&all=${all}`;

export const getCourseBlockApiUrl = (courseId) => {
  const formattedCourseId = courseId.split('course-v1:')[1];
  return `${getApiBaseUrl()}/xblock/block-v1:${formattedCourseId}+type@course+block@course`;
};

export const getCourseReindexApiUrl = (reindexLink) => `${getApiBaseUrl()}${reindexLink}`;
export const getXBlockBaseApiUrl = () => `${getApiBaseUrl()}/xblock/`;
export const getCourseItemApiUrl = (itemId) => `${getXBlockBaseApiUrl()}${itemId}`;
export const getXBlockApiUrl = (blockId) => `${getXBlockBaseApiUrl()}outline/${blockId}`;
export const getClipboardUrl = () => `${getApiBaseUrl()}/api/content-staging/v1/clipboard/`;
export const exportTags = (courseId) => `${getApiBaseUrl()}/api/content_tagging/v1/object_tags/${courseId}/export/`;

/**
 * @typedef {Object} courseOutline
 * @property {string} courseReleaseDate
 * @property {Object} courseStructure
 * @property {Object} deprecatedBlocksInfo
 * @property {string} discussionsIncontextFeedbackUrl
 * @property {string} discussionsIncontextLearnmoreUrl
 * @property {Object} initialState
 * @property {Object} initialUserClipboard
 * @property {string} languageCode
 * @property {string} lmsLink
 * @property {string} mfeProctoredExamSettingsUrl
 * @property {string} notificationDismissUrl
 * @property {string[]} proctoringErrors
 * @property {string} reindexLink
 * @property {null} rerunNotificationId
 */

/**
 * Get course outline index.
 * @param {string} courseId
 * @returns {Promise<courseOutline>}
 */
export async function getCourseOutlineIndex(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseOutlineIndexApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Get course best practices.
 * @param {{courseId: string, excludeGraded: boolean, all: boolean}} options
 * @returns {Promise<{isSelfPaced: boolean, sections: any, subsection: any, units: any, videos: any }>}
 */
export async function getCourseBestPractices({
  courseId,
  excludeGraded,
  all,
}) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseBestPracticesApiUrl({ courseId, excludeGraded, all }));

  return camelCaseObject(data);
}

/** @typedef {object} courseLaunchData
 * @property {boolean} isSelfPaced
 * @property {object} dates
 * @property {object} assignments
 * @property {object} grades
 * @property {number} grades.sum_of_weights
 * @property {object} certificates
 * @property {object} updates
 * @property {object} proctoring
 */

/**
 * Get course launch.
 * @param {{courseId: string, gradedOnly: boolean, validateOras: boolean, all: boolean}} options
 * @returns {Promise<courseLaunchData>}
 */
export async function getCourseLaunch({
  courseId,
  gradedOnly,
  validateOras,
  all,
}) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseLaunchApiUrl({
      courseId, gradedOnly, validateOras, all,
    }));

  return camelCaseObject(data);
}

/**
 * Enable course highlights emails
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function enableCourseHighlightsEmails(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseBlockApiUrl(courseId), {
      publish: 'republish',
      metadata: {
        highlights_enabled_for_messaging: true,
      },
    });

  return data;
}

/**
 * Restart reindex course
 * @param {string} reindexLink
 * @returns {Promise<Object>}
 */
export async function restartIndexingOnCourse(reindexLink) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseReindexApiUrl(reindexLink));

  return camelCaseObject(data);
}

/**
 * @typedef {Object} section
 * @property {string} id
 * @property {string} displayName
 * @property {string} category
 * @property {boolean} hasChildren
 * @property {string} editedOn
 * @property {boolean} published
 * @property {string} publishedOn
 * @property {string} studioUrl
 * @property {boolean} releasedToStudents
 * @property {string} releaseDate
 * @property {string} visibilityState
 * @property {boolean} hasExplicitStaffLock
 * @property {string} start
 * @property {boolean} graded
 * @property {string} dueDate
 * @property {null} due
 * @property {null} relativeWeeksDue
 * @property {null} format
 * @property {string[]} courseGraders
 * @property {boolean} hasChanges
 * @property {object} actions
 * @property {null} explanatoryMessage
 * @property {object[]} userPartitions
 * @property {string} showCorrectness
 * @property {string[]} highlights
 * @property {boolean} highlightsEnabled
 * @property {boolean} highlightsPreviewOnly
 * @property {string} highlightsDocUrl
 * @property {object} childInfo
 * @property {boolean} ancestorHasStaffLock
 * @property {boolean} staffOnlyMessage
 * @property {boolean} hasPartitionGroupComponents
 * @property {object} userPartitionInfo
 * @property {boolean} enableCopyPasteUnits
 */

/**
 * Get course section
 * @param {string} itemId
 * @returns {Promise<section>}
 */
export async function getCourseItem(itemId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getXBlockApiUrl(itemId));
  return camelCaseObject(data);
}

/**
 * Update course section highlights
 * @param {string} sectionId
 * @param {Array<string>} highlights
 * @returns {Promise<Object>}
 */
export async function updateCourseSectionHighlights(sectionId, highlights) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseItemApiUrl(sectionId), {
      publish: 'republish',
      metadata: {
        highlights,
      },
    });

  return data;
}

/**
 * Publish course section
 * @param {string} sectionId
 * @returns {Promise<Object>}
 */
export async function publishCourseSection(sectionId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseItemApiUrl(sectionId), {
      publish: 'make_public',
    });

  return data;
}

/**
 * Configure course section
 * @param {string} sectionId
 * @param {boolean} isVisibleToStaffOnly
 * @param {string} startDatetime
 * @returns {Promise<Object>}
 */
export async function configureCourseSection(sectionId, isVisibleToStaffOnly, startDatetime) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseItemApiUrl(sectionId), {
      publish: 'republish',
      metadata: {
        // The backend expects metadata.visible_to_staff_only to either true or null
        visible_to_staff_only: isVisibleToStaffOnly ? true : null,
        start: startDatetime,
      },
    });

  return data;
}

/**
 * Configure course section
 * @param {string} itemId
 * @param {string} isVisibleToStaffOnly
 * @param {string} releaseDate
 * @param {string} graderType
 * @param {string} dueDate
 * @param {boolean} isProctoredExam,
 * @param {boolean} isOnboardingExam,
 * @param {boolean} isPracticeExam,
 * @param {string} examReviewRules,
 * @param {boolean} isTimeLimited
 * @param {number} defaultTimeLimitMin
 * @param {string} hideAfterDue
 * @param {string} showCorrectness
 * @param {boolean} isPrereq,
 * @param {string} prereqUsageKey,
 * @param {number} prereqMinScore,
 * @param {number} prereqMinCompletion,
 * @returns {Promise<Object>}
 */
export async function configureCourseSubsection(
  itemId,
  isVisibleToStaffOnly,
  releaseDate,
  graderType,
  dueDate,
  isTimeLimited,
  isProctoredExam,
  isOnboardingExam,
  isPracticeExam,
  examReviewRules,
  defaultTimeLimitMin,
  hideAfterDue,
  showCorrectness,
  isPrereq,
  prereqUsageKey,
  prereqMinScore,
  prereqMinCompletion,
) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseItemApiUrl(itemId), {
      publish: 'republish',
      graderType,
      isPrereq,
      prereqUsageKey,
      prereqMinScore,
      prereqMinCompletion,
      metadata: {
        // The backend expects metadata.visible_to_staff_only to either true or null
        visible_to_staff_only: isVisibleToStaffOnly ? true : null,
        due: dueDate,
        hide_after_due: hideAfterDue,
        show_correctness: showCorrectness,
        is_practice_exam: isPracticeExam,
        is_time_limited: isTimeLimited,
        is_proctored_enabled: isProctoredExam || isPracticeExam || isOnboardingExam,
        exam_review_rules: examReviewRules,
        default_time_limit_minutes: defaultTimeLimitMin,
        is_onboarding_exam: isOnboardingExam,
        start: releaseDate,
      },
    });
  return data;
}

/**
 * Configure course unit
 * @param {string} unitId
 * @param {boolean} isVisibleToStaffOnly
 * @param {object} groupAccess
 * @returns {Promise<Object>}
 */
export async function configureCourseUnit(unitId, isVisibleToStaffOnly, groupAccess, discussionEnabled) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseItemApiUrl(unitId), {
      publish: 'republish',
      metadata: {
        // The backend expects metadata.visible_to_staff_only to either true or null
        visible_to_staff_only: isVisibleToStaffOnly ? true : null,
        group_access: groupAccess,
        discussion_enabled: discussionEnabled,
      },
    });

  return data;
}

/**
 * Edit course section
 * @param {string} itemId
 * @param {string} displayName
 * @returns {Promise<Object>}
 */
export async function editItemDisplayName(itemId, displayName) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseItemApiUrl(itemId), {
      metadata: {
        display_name: displayName,
      },
    });

  return data;
}

/**
 * Delete course section
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
export async function deleteCourseItem(itemId) {
  const { data } = await getAuthenticatedHttpClient()
    .delete(getCourseItemApiUrl(itemId));

  return data;
}

/**
 * Duplicate course section
 * @param {string} itemId
 * @param {string} parentId
 * @returns {Promise<Object>}
 */
export async function duplicateCourseItem(itemId, parentId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXBlockBaseApiUrl(), {
      duplicate_source_locator: itemId,
      parent_locator: parentId,
    });

  return data;
}

/**
 * Add new course item like section, subsection or unit.
 * @param {string} parentLocator
 * @param {string} category
 * @param {string} displayName
 * @returns {Promise<Object>}
 */
export async function addNewCourseItem(parentLocator, category, displayName) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXBlockBaseApiUrl(), {
      parent_locator: parentLocator,
      category,
      display_name: displayName,
    });

  return data;
}

/**
 * Set order for the list of the sections
 * @param {string} courseId
 * @param {Array<string>} children list of sections id's
 * @returns {Promise<Object>}
*/
export async function setSectionOrderList(courseId, children) {
  const { data } = await getAuthenticatedHttpClient()
    .put(getCourseBlockApiUrl(courseId), {
      children,
    });

  return data;
}

/**
 * Set order for the list of the subsections
 * @param {string} itemId Subsection or unit ID
 * @param {Array<string>} children list of sections id's
 * @returns {Promise<Object>}
*/
export async function setCourseItemOrderList(itemId, children) {
  const { data } = await getAuthenticatedHttpClient()
    .put(getCourseItemApiUrl(itemId), {
      children,
    });

  return data;
}

/**
 * Set video sharing setting
 * @param {string} courseId
 * @param {string} videoSharingOption
 * @returns {Promise<Object>}
*/
export async function setVideoSharingOption(courseId, videoSharingOption) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseBlockApiUrl(courseId), {
      metadata: {
        video_sharing_options: videoSharingOption,
      },
    });

  return data;
}

/**
 * Paste block to clipboard
 * @param {string} parentLocator
 * @returns {Promise<Object>}
*/
export async function pasteBlock(parentLocator) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXBlockBaseApiUrl(), {
      parent_locator: parentLocator,
      staged_content: 'clipboard',
    });

  return camelCaseObject(data);
}

/**
 * Dismiss notification
 * @param {string} url
 * @returns void
*/
export async function dismissNotification(url) {
  await getAuthenticatedHttpClient()
    .delete(url);
}

/**
 * Downloads the file of the exported tags
 * @param {string} courseId The ID of the content
 * @returns void
 */
export async function getTagsExportFile(courseId, courseName) {
  // Gets exported tags and builds the blob to download CSV file.
  // This can be done with this code:
  // `window.location.href = exportTags(contentId);`
  // but it is done in this way so we know when the operation ends to close the toast.
  const response = await getAuthenticatedHttpClient().get(exportTags(courseId), {
    responseType: 'blob',
  });

  /* istanbul ignore next */
  if (response.status !== 200) {
    throw response.statusText;
  }

  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${courseName}.csv`;
  a.click();

  window.URL.revokeObjectURL(url);
}
