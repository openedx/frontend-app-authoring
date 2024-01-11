import { logError, logInfo } from '@edx/frontend-platform/logging';

import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import {
  addModel, updateModel, updateModels, updateModelsMap, addModelsMap,
} from '../../generic/model-store';
import {
  getCourseUnitData,
  editUnitDisplayName,
  getSequenceMetadata,
  getCourseMetadata,
  getLearningSequencesOutline,
  getCourseHomeCourseMetadata,
  getCourseSectionVerticalData,
  createCourseXblock,
} from './api';
import {
  updateLoadingCourseUnitStatus,
  fetchCourseItemSuccess,
  updateSavingStatus,
  fetchSequenceRequest,
  fetchSequenceFailure,
  fetchSequenceSuccess,
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseDenied,
  fetchCourseFailure,
  fetchCourseSectionVerticalDataSuccess,
  updateLoadingCourseSectionVerticalDataStatus,
  updateLoadingCourseXblockStatus,
} from './slice';

export function fetchCourseUnitQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseUnitStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const courseUnit = await getCourseUnitData(courseId);
      dispatch(fetchCourseItemSuccess(courseUnit));
      dispatch(updateLoadingCourseUnitStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingCourseUnitStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchCourseSectionVerticalData(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const courseSectionVerticalData = await getCourseSectionVerticalData(courseId);
      dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingCourseSectionVerticalDataStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function editCourseItemQuery(itemId, displayName) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      await editUnitDisplayName(itemId, displayName).then(async (result) => {
        if (result) {
          const courseUnit = await getCourseUnitData(itemId);
          dispatch(fetchCourseItemSuccess(courseUnit));
          dispatch(hideProcessingNotification());
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function fetchSequence(sequenceId) {
  return async (dispatch) => {
    dispatch(fetchSequenceRequest({ sequenceId }));
    try {
      const { sequence, units } = await getSequenceMetadata(sequenceId);

      if (sequence.blockType !== 'sequential') {
        // Some other block types (particularly 'chapter') can be returned
        // by this API. We want to error in that case, since downstream
        // courseware code is written to render Sequences of Units.
        logError(
          `Requested sequence '${sequenceId}' `
            + `has block type '${sequence.blockType}'; expected block type 'sequential'.`,
        );
        dispatch(fetchSequenceFailure({ sequenceId }));
      } else {
        dispatch(updateModel({
          modelType: 'sequences',
          model: sequence,
        }));
        dispatch(updateModels({
          modelType: 'units',
          models: units,
        }));
        dispatch(fetchSequenceSuccess({ sequenceId }));
      }
    } catch (error) {
      // Some errors are expected - for example, CoursewareContainer may request sequence metadata for a unit and rely
      // on the request failing to notice that it actually does have a unit (mostly so it doesn't have to know anything
      // about the opaque key structure). In such cases, the backend gives us a 422.
      const sequenceMightBeUnit = error?.response?.status === 422;
      if (!sequenceMightBeUnit) {
        logError(error);
      }
      dispatch(fetchSequenceFailure({ sequenceId, sequenceMightBeUnit }));
    }
  };
}

export function fetchCourse(courseId) {
  return async (dispatch) => {
    dispatch(fetchCourseRequest({ courseId }));
    Promise.allSettled([
      getCourseMetadata(courseId),
      getLearningSequencesOutline(courseId),
      getCourseHomeCourseMetadata(courseId, 'courseware'),
    ]).then(([
      courseMetadataResult,
      learningSequencesOutlineResult,
      courseHomeMetadataResult]) => {
      if (courseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'coursewareMeta',
          model: courseMetadataResult.value,
        }));
      }

      if (courseHomeMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courseHomeMeta',
          model: {
            id: courseId,
            ...courseHomeMetadataResult.value,
          },
        }));
      }

      if (learningSequencesOutlineResult.status === 'fulfilled') {
        const {
          courses, sections, sequences,
        } = learningSequencesOutlineResult.value;

        // This updates the course with a sectionIds array from the Learning Sequence data.
        dispatch(updateModelsMap({
          modelType: 'coursewareMeta',
          modelsMap: courses,
        }));
        dispatch(addModelsMap({
          modelType: 'sections',
          modelsMap: sections,
        }));
        // We update for sequences because the sequence metadata may have come back first.
        dispatch(updateModelsMap({
          modelType: 'sequences',
          modelsMap: sequences,
        }));
      }

      const fetchedMetadata = courseMetadataResult.status === 'fulfilled';
      const fetchedCourseHomeMetadata = courseHomeMetadataResult.status === 'fulfilled';
      const fetchedOutline = learningSequencesOutlineResult.status === 'fulfilled';

      // Log errors for each request if needed. Outline failures may occur
      // even if the course metadata request is successful
      if (!fetchedOutline) {
        const { response } = learningSequencesOutlineResult.reason;
        if (response && response.status === 403) {
          // 403 responses are normal - they happen when the learner is logged out.
          // We'll redirect them in a moment to the outline tab by calling fetchCourseDenied() below.
          logInfo(learningSequencesOutlineResult.reason);
        } else {
          logError(learningSequencesOutlineResult.reason);
        }
      }
      if (!fetchedMetadata) {
        logError(courseMetadataResult.reason);
      }
      if (!fetchedCourseHomeMetadata) {
        logError(courseHomeMetadataResult.reason);
      }
      if (fetchedMetadata && fetchedCourseHomeMetadata) {
        if (courseHomeMetadataResult.value.courseAccess.hasAccess && fetchedOutline) {
          // User has access
          dispatch(fetchCourseSuccess({ courseId }));
          return;
        }
        // User either doesn't have access or only has partial access
        // (can't access course blocks)
        dispatch(fetchCourseDenied({ courseId }));
        return;
      }

      // Definitely an error happening
      dispatch(fetchCourseFailure({ courseId }));
    });
  };
}

export function createNewCourseXblock(body) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.IN_PROGRESS }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.adding));
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      await createCourseXblock(body).then(async (result) => {
        if (result) {
          // ToDo: implement fetching (update) xblocks after success creating
          dispatch(hideProcessingNotification());
          dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.SUCCESSFUL }));
          dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        }
      });
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateLoadingCourseXblockStatus({ status: RequestStatus.FAILED }));
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
