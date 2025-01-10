/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { VIDEO_SHARING_OPTIONS } from '../constants';
import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'courseOutline',
  initialState: {
    loadingStatus: {
      outlineIndexLoadingStatus: RequestStatus.IN_PROGRESS,
      reIndexLoadingStatus: RequestStatus.IN_PROGRESS,
      fetchSectionLoadingStatus: RequestStatus.IN_PROGRESS,
      courseLaunchQueryStatus: RequestStatus.IN_PROGRESS,
    },
    errors: {
      outlineIndexApi: null,
      reindexApi: null,
      sectionLoadingApi: null,
      courseLaunchApi: null,
    },
    outlineIndexData: {},
    savingStatus: '',
    statusBarData: {
      courseReleaseDate: '',
      highlightsEnabledForMessaging: false,
      isSelfPaced: false,
      checklist: {
        totalCourseLaunchChecks: 0,
        completedCourseLaunchChecks: 0,
        totalCourseBestPracticesChecks: 0,
        completedCourseBestPracticesChecks: 0,
      },
      videoSharingEnabled: false,
      videoSharingOptions: VIDEO_SHARING_OPTIONS.perVideo,
    },
    sectionsList: [],
    isCustomRelativeDatesActive: false,
    currentSection: {},
    currentSubsection: {},
    currentItem: {},
    actions: {
      deletable: true,
      draggable: true,
      childAddable: true,
      duplicable: true,
    },
    enableProctoredExams: false,
    pasteFileNotices: {},
  },
  reducers: {
    fetchOutlineIndexSuccess: (state, { payload }) => {
      state.outlineIndexData = payload;
      state.sectionsList = payload.courseStructure?.childInfo?.children || [];
      state.isCustomRelativeDatesActive = payload.isCustomRelativeDatesActive;
      state.enableProctoredExams = payload.courseStructure?.enableProctoredExams;
    },
    updateOutlineIndexLoadingStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        outlineIndexLoadingStatus: payload.status,
      };
      state.errors.outlineIndexApi = payload.errors || null;
    },
    updateReindexLoadingStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        reIndexLoadingStatus: payload.status,
      };
      state.errors.reindexApi = payload.errors || null;
    },
    updateFetchSectionLoadingStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        fetchSectionLoadingStatus: payload.status,
      };
      state.errors.sectionLoadingApi = payload.errors || null;
    },
    updateCourseLaunchQueryStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        courseLaunchQueryStatus: payload.status,
      };
      state.errors.courseLaunchApi = payload.errors || null;
    },
    dismissError: (state, { payload }) => {
      state.errors[payload] = null;
    },
    updateStatusBar: (state, { payload }) => {
      state.statusBarData = {
        ...state.statusBarData,
        ...payload,
      };
    },
    updateCourseActions: (state, { payload }) => {
      state.actions = {
        ...state.actions,
        ...payload,
      };
    },
    fetchStatusBarChecklistSuccess: (state, { payload }) => {
      state.statusBarData.checklist = {
        ...state.statusBarData.checklist,
        ...payload,
      };
    },
    fetchStatusBarSelfPacedSuccess: (state, { payload }) => {
      state.statusBarData.isSelfPaced = payload.isSelfPaced;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateSectionList: (state, { payload }) => {
      state.sectionsList = state.sectionsList.map((section) => (section.id in payload ? payload[section.id] : section));
    },
    setCurrentItem: (state, { payload }) => {
      state.currentItem = payload;
    },
    reorderSectionList: (state, { payload }) => {
      const sectionsList = [...state.sectionsList];
      sectionsList.sort((a, b) => payload.indexOf(a.id) - payload.indexOf(b.id));

      state.sectionsList = [...sectionsList];
    },
    setCurrentSection: (state, { payload }) => {
      state.currentSection = payload;
    },
    setCurrentSubsection: (state, { payload }) => {
      state.currentSubsection = payload;
    },
    addSection: (state, { payload }) => {
      state.sectionsList = [
        ...state.sectionsList,
        payload,
      ];
    },
    addSubsection: (state, { payload }) => {
      state.sectionsList = state.sectionsList.map((section) => {
        if (section.id === payload.parentLocator) {
          section.childInfo.children = [
            ...section.childInfo.children,
            payload.data,
          ];
        }
        return section;
      });
    },
    deleteSection: (state, { payload }) => {
      state.sectionsList = state.sectionsList.filter(
        ({ id }) => id !== payload.itemId,
      );
    },
    deleteSubsection: (state, { payload }) => {
      state.sectionsList = state.sectionsList.map((section) => {
        if (section.id !== payload.sectionId) {
          return section;
        }
        section.childInfo.children = section.childInfo.children.filter(
          ({ id }) => id !== payload.itemId,
        );
        return section;
      });
    },
    deleteUnit: (state, { payload }) => {
      state.sectionsList = state.sectionsList.map((section) => {
        if (section.id !== payload.sectionId) {
          return section;
        }
        section.childInfo.children = section.childInfo.children.map((subsection) => {
          if (subsection.id !== payload.subsectionId) {
            return subsection;
          }
          subsection.childInfo.children = subsection.childInfo.children.filter(
            ({ id }) => id !== payload.itemId,
          );
          return subsection;
        });
        return section;
      });
    },
    duplicateSection: (state, { payload }) => {
      state.sectionsList = state.sectionsList.reduce((result, currentValue) => {
        if (currentValue.id === payload.id) {
          return [...result, currentValue, payload.duplicatedItem];
        }
        return [...result, currentValue];
      }, []);
    },
    setPasteFileNotices: (state, { payload }) => {
      state.pasteFileNotices = payload;
    },
    removePasteFileNotices: (state, { payload }) => {
      const pasteFileNotices = { ...state.pasteFileNotices };
      payload.forEach((key) => delete pasteFileNotices[key]);
      state.pasteFileNotices = pasteFileNotices;
    },
  },
});

export const {
  addSection,
  addSubsection,
  fetchOutlineIndexSuccess,
  updateOutlineIndexLoadingStatus,
  updateReindexLoadingStatus,
  updateStatusBar,
  updateCourseActions,
  fetchStatusBarChecklistSuccess,
  fetchStatusBarSelfPacedSuccess,
  updateFetchSectionLoadingStatus,
  updateCourseLaunchQueryStatus,
  updateSavingStatus,
  updateSectionList,
  setCurrentItem,
  setCurrentSection,
  setCurrentSubsection,
  deleteSection,
  deleteSubsection,
  deleteUnit,
  duplicateSection,
  reorderSectionList,
  reorderSubsectionList,
  reorderUnitList,
  setPasteFileNotices,
  removePasteFileNotices,
  dismissError,
} = slice.actions;

export const {
  reducer,
} = slice;
