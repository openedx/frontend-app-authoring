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
    initialUserClipboard: {
      content: {},
      sourceUsageKey: null,
      sourceContexttitle: null,
      sourceEditUrl: null,
    },
    enableProctoredExams: false,
    pasteFileNotices: {},
  },
  reducers: {
    fetchOutlineIndexSuccess: (state, { payload }) => {
      state.outlineIndexData = payload;
      state.sectionsList = payload.courseStructure?.childInfo?.children || [];
      state.isCustomRelativeDatesActive = payload.isCustomRelativeDatesActive;
      state.initialUserClipboard = payload.initialUserClipboard;
      state.enableProctoredExams = payload.courseStructure?.enableProctoredExams;
    },
    updateOutlineIndexLoadingStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        outlineIndexLoadingStatus: payload.status,
      };
    },
    updateReindexLoadingStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        reIndexLoadingStatus: payload.status,
      };
    },
    updateFetchSectionLoadingStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        fetchSectionLoadingStatus: payload.status,
      };
    },
    updateStatusBar: (state, { payload }) => {
      state.statusBarData = {
        ...state.statusBarData,
        ...payload,
      };
    },
    updateClipboardContent: (state, { payload }) => {
      state.initialUserClipboard = payload;
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
    fetchStatusBarSelPacedSuccess: (state, { payload }) => {
      state.statusBarData.isSelfPaced = payload.isSelfPaced;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateSectionList: (state, { payload }) => {
      state.sectionsList = state.sectionsList.map((section) => (section.id === payload.id ? payload : section));
    },
    setCurrentItem: (state, { payload }) => {
      state.currentItem = payload;
    },
    reorderSectionList: (state, { payload }) => {
      const sectionsList = [...state.sectionsList];
      sectionsList.sort((a, b) => payload.indexOf(a.id) - payload.indexOf(b.id));

      state.sectionsList = [...sectionsList];
    },
    reorderSubsectionList: (state, { payload }) => {
      const { sectionId, subsectionListIds } = payload;
      const sections = [...state.sectionsList];
      const i = sections.findIndex(section => section.id === sectionId);
      sections[i].childInfo.children.sort((a, b) => subsectionListIds.indexOf(a.id) - subsectionListIds.indexOf(b.id));
      state.sectionsList = [...sections];
    },
    reorderUnitList: (state, { payload }) => {
      const { sectionId, subsectionId, unitListIds } = payload;
      const sections = [...state.sectionsList];
      const i = sections.findIndex(section => section.id === sectionId);
      const j = sections[i].childInfo.children.findIndex(subsection => subsection.id === subsectionId);
      const subsection = sections[i].childInfo.children[j];
      subsection.childInfo.children.sort((a, b) => unitListIds.indexOf(a.id) - unitListIds.indexOf(b.id));
      state.sectionsList = [...sections];
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
  fetchStatusBarSelPacedSuccess,
  updateFetchSectionLoadingStatus,
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
  updateClipboardContent,
  setPasteFileNotices,
  removePasteFileNotices,
} = slice.actions;

export const {
  reducer,
} = slice;
