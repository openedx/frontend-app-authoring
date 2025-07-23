/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '@src/data/constants';
import { VIDEO_SHARING_OPTIONS } from '../constants';
import { CourseOutlineState } from './types';

const initialState = {
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
    allowMoveUp: false,
    allowMoveDown: false,
  },
  enableProctoredExams: false,
  pasteFileNotices: {},
  createdOn: null,
} satisfies CourseOutlineState as unknown as CourseOutlineState;

const slice = createSlice({
  name: 'courseOutline',
  initialState,
  reducers: {
    fetchOutlineIndexSuccess: (state: CourseOutlineState, { payload }) => {
      state.outlineIndexData = payload;
      state.sectionsList = payload.courseStructure?.childInfo?.children || [];
      state.isCustomRelativeDatesActive = payload.isCustomRelativeDatesActive;
      state.enableProctoredExams = payload.courseStructure?.enableProctoredExams;
      state.createdOn = payload.createdOn;
    },
    updateOutlineIndexLoadingStatus: (state: CourseOutlineState, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        outlineIndexLoadingStatus: payload.status,
      };
      state.errors.outlineIndexApi = payload.errors || null;
    },
    updateReindexLoadingStatus: (state: CourseOutlineState, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        reIndexLoadingStatus: payload.status,
      };
      state.errors.reindexApi = payload.errors || null;
    },
    updateFetchSectionLoadingStatus: (state: CourseOutlineState, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        fetchSectionLoadingStatus: payload.status,
      };
      state.errors.sectionLoadingApi = payload.errors || null;
    },
    updateCourseLaunchQueryStatus: (state: CourseOutlineState, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        courseLaunchQueryStatus: payload.status,
      };
      state.errors.courseLaunchApi = payload.errors || null;
    },
    dismissError: (state: CourseOutlineState, { payload }) => {
      state.errors[payload] = null;
    },
    updateStatusBar: (state: CourseOutlineState, { payload }) => {
      state.statusBarData = {
        ...state.statusBarData,
        ...payload,
      };
    },
    updateCourseActions: (state: CourseOutlineState, { payload }) => {
      state.actions = {
        ...state.actions,
        ...payload,
      };
    },
    fetchStatusBarChecklistSuccess: (state: CourseOutlineState, { payload }) => {
      state.statusBarData.checklist = {
        ...state.statusBarData.checklist,
        ...payload,
      };
    },
    fetchStatusBarSelfPacedSuccess: (state: CourseOutlineState, { payload }) => {
      state.statusBarData.isSelfPaced = payload.isSelfPaced;
    },
    updateSavingStatus: (state: CourseOutlineState, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateSectionList: (state: CourseOutlineState, { payload }) => {
      state.sectionsList = state.sectionsList.map((section) => (section.id in payload ? payload[section.id] : section));
    },
    setCurrentItem: (state: CourseOutlineState, { payload }) => {
      state.currentItem = payload;
    },
    reorderSectionList: (state: CourseOutlineState, { payload }) => {
      const sectionsList = [...state.sectionsList];
      sectionsList.sort((a, b) => payload.indexOf(a.id) - payload.indexOf(b.id));

      state.sectionsList = [...sectionsList];
    },
    setCurrentSection: (state: CourseOutlineState, { payload }) => {
      state.currentSection = payload;
    },
    setCurrentSubsection: (state: CourseOutlineState, { payload }) => {
      state.currentSubsection = payload;
    },
    addSection: (state: CourseOutlineState, { payload }) => {
      state.sectionsList = [
        ...state.sectionsList,
        payload,
      ];
    },
    resetScrollField: (state) => {
      state.sectionsList = state.sectionsList.map((section) => {
        section.shouldScroll = false;
        section.childInfo.children.map((subsection) => {
          subsection.shouldScroll = false;
          return subsection;
        });
        return section;
      });
    },
    addSubsection: (state: CourseOutlineState, { payload }) => {
      state.sectionsList = state.sectionsList.map((section) => {
        if (section.id === payload.parentLocator) {
          section.childInfo.children = [
            ...section.childInfo.children.filter(child => child.id !== payload.data.id), // Filter to avoid duplicates
            payload.data,
          ];
        }
        return section;
      });
    },
    deleteSection: (state: CourseOutlineState, { payload }) => {
      state.sectionsList = state.sectionsList.filter(
        ({ id }) => id !== payload.itemId,
      );
    },
    deleteSubsection: (state: CourseOutlineState, { payload }) => {
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
    deleteUnit: (state: CourseOutlineState, { payload }) => {
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
    duplicateSection: (state: CourseOutlineState, { payload }) => {
      state.sectionsList = state.sectionsList.reduce((result, currentValue) => {
        if (currentValue.id === payload.id) {
          return [...result, currentValue, payload.duplicatedItem];
        }
        return [...result, currentValue];
      }, []);
    },
    setPasteFileNotices: (state: CourseOutlineState, { payload }) => {
      state.pasteFileNotices = payload;
    },
    removePasteFileNotices: (state: CourseOutlineState, { payload }) => {
      const pasteFileNotices = { ...state.pasteFileNotices };
      payload.forEach((key: string | number) => delete pasteFileNotices[key]);
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
  setPasteFileNotices,
  removePasteFileNotices,
  dismissError,
  resetScrollField,
} = slice.actions;

export const {
  reducer,
} = slice;
