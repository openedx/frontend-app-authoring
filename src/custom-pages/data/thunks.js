import { RequestStatus } from '../../data/constants';
import {
  addModel,
  addModels,
  removeModel,
  // updateModel,
 } from '../../generic/model-store';
import {
  getCustomPages,
  deleteCustomPage,
  addCustomPage,
  updateCustomPageOrder,
} from './api';
import {
  fetchCustomPagesSuccess,
  updateCustomPagesApiStatus,
  updateLoadingStatus,
  updateAddingStatus,
  updateDeletingStatus,
  deleteCustomPageSuccess,
  addCustomPageSuccess,
} from './slice';

/* eslint-disable import/prefer-default-export */
export function fetchCustomPages(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const customPages = await getCustomPages(courseId);

      dispatch(addModels({ modelType: 'customPages', models: customPages }));
      dispatch(fetchCustomPagesSuccess({
        customPagesIds: customPages.map(page => page.id),
      }));
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateCustomPagesApiStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
    }
  };
}

export function deleteSingleCustomPage({ blockId, closeConfirmation }) {
  return async (dispatch) => {
    dispatch(updateDeletingStatus({ status: RequestStatus.PENDING }));

    try {
      await deleteCustomPage(blockId);
      dispatch(removeModel({ modelType: 'customPages', model: blockId }));
      dispatch(deleteCustomPageSuccess({
        customPageId: blockId,
      }));
      dispatch(updateDeletingStatus({ status: RequestStatus.SUCCESSFUL }));
      closeConfirmation();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateDeletingStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateDeletingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function addSingleCustomPage(courseId) {
  return async (dispatch) => {
    dispatch(updateAddingStatus({ status: RequestStatus.PENDING }));

    try {
      const pageData = await addCustomPage(courseId);
      dispatch(addModel({ modelType: 'customPages', model: { id: pageData.locator, ...pageData } }));
      dispatch(addCustomPageSuccess({
        customPageId: pageData.locator,
      }));
      dispatch(updateAddingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateAddingStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateAddingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function updatePageOrder(courseId, pages) {
  return async (dispatch) => {
    // dispatch(updateAddingStatus({ status: RequestStatus.PENDING }));
    const tabs = [];
    pages.forEach(page => {
      const currentTab = {};
      currentTab.tab_id = `${page.type}_${page.urlSlug}`;
      currentTab.tab_locator = page.id;
      tabs.push(currentTab);
    });
    try {
      await updateCustomPageOrder(courseId, tabs);
      // dispatch(updateModels({ modelType: 'customPages', model: {id: pageData.locator, ...pageData} }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateCustomPagesApiStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
// export function updateSingleCustomPage(blockId, data, metadata) {
//   return async (dispatch) => {
//     dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

//     try {
//       await updateCourseApp(courseId, appId, state);
//       dispatch(updateModel({ modelType: 'courseApps', model: { id: blockId, data, ...metadata } }));
//       // dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
//       return true;
//     } catch (error) {
//       dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
//       return false;
//     }
//   };
// }
