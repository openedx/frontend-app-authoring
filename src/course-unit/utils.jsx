/* eslint-disable max-len */
// @ts-check

/**
 * Method to return course unit view live URL path.
 * @param {string} courseId
 * @param {string} blockId
 * @returns {string} {`/courses/${string}/jump_to/${string}`}
 */
export const getUnitViewLivePath = (courseId, blockId) => (
  `/courses/${courseId}/jump_to/${blockId}`
);

/**
 * Method to return course unit preview URL path.
 * @param {string} courseId
 * @param {string} sectionId
 * @param {string} blockId
 * @returns {string} {`/courses/${courseId}/courseware/interactive_demonstrations/${sectionId}/1?activate_block_id=${blockId}`}
 */
export const getUnitPreviewPath = (courseId, sectionId, subsectionId, blockId) => (
  `/courses/${courseId}/courseware/${sectionId}/${subsectionId}/1?activate_block_id=${blockId}`
);
