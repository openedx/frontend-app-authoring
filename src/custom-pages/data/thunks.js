import { RequestStatus } from '../../data/constants';
import {
  addModel,
  addModels,
  removeModel,
  updateModel,
  updateModels,
} from '../../generic/model-store';
import {
  getCustomPages,
  deleteCustomPage,
  addCustomPage,
  updateCustomPage,
  updateCustomPageOrder,
} from './api';
import {
  setPageIds,
  updateCustomPagesApiStatus,
  updateLoadingStatus,
  updateSavingStatus,
  updateAddingStatus,
  updateDeletingStatus,
  deleteCustomPageSuccess,
  addCustomPageSuccess,
} from './slice';

export function fetchCustomPages(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const customPages = await getCustomPages(courseId);

      dispatch(addModels({ modelType: 'customPages', models: customPages }));
      dispatch(setPageIds({
        customPagesIds: customPages.map(page => page.id),
      }));
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.DENIED }));
      } else {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
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
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateDeletingStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateDeletingStatus({ status: RequestStatus.FAILED }));
    }
    closeConfirmation();
  };
}

export function addSingleCustomPage(courseId) {
  return async (dispatch) => {
    dispatch(updateAddingStatus({ status: RequestStatus.PENDING }));

    try {
      const pageData = await addCustomPage(courseId);
      dispatch(addModel({
        modelType: 'customPages',
        model: {
          id: pageData.locator,
          courseStaffOnly: false,
          ...pageData,
        },
      }));
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
  const tabs = [];
  pages.forEach(page => {
    const currentTab = {};
    currentTab.tab_locator = page.id;
    tabs.push(currentTab);
  });
  return async (dispatch) => {
    try {
      await updateCustomPageOrder(courseId, tabs);
      dispatch(updateModels({ modelType: 'customPages', models: pages }));
      dispatch(setPageIds({
        customPagesIds: pages.map(page => page.id),
      }));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateCustomPagesApiStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function updateCustomPageVisibility({ blockId, metadata }) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const pageData = await updateCustomPage({ blockId, metadata });
      dispatch(updateModel({
        modelType: 'customPages',
        model: {
          id: blockId,
          courseStaffOnly: pageData.metadata.courseStaffOnly,
        },
      }));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export const updateSingleCustomPage = ({
  blockId,
  metadata,
  setCurrentPage,
}) => (dispatch) => {
  dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
  try {
    dispatch(updateModel({
      modelType: 'customPages',
      model: {
        id: blockId,
        name: metadata.displayName,
      },
    }));
    setCurrentPage(null);
    dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
  } catch (error) {
    dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
  }
};
