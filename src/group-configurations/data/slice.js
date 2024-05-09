/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'groupConfigurations',
  initialState: {
    savingStatus: '',
    errorMessage: '',
    loadingStatus: RequestStatus.IN_PROGRESS,
    groupConfigurations: {},
  },
  reducers: {
    fetchGroupConfigurations: (state, { payload }) => {
      state.groupConfigurations = payload.groupConfigurations;
    },
    updateGroupConfigurationsSuccess: (state, { payload }) => {
      const groupIndex = state.groupConfigurations.allGroupConfigurations.findIndex(
        group => payload.data.id === group.id,
      );

      if (groupIndex !== -1) {
        state.groupConfigurations.allGroupConfigurations[groupIndex] = payload.data;
      }
    },
    deleteGroupConfigurationsSuccess: (state, { payload }) => {
      const { parentGroupId, groupId } = payload;
      const parentGroupIndex = state.groupConfigurations.allGroupConfigurations.findIndex(
        group => parentGroupId === group.id,
      );
      if (parentGroupIndex !== -1) {
        state.groupConfigurations.allGroupConfigurations[parentGroupIndex].groups = state
          .groupConfigurations.allGroupConfigurations[parentGroupIndex].groups.filter(group => group.id !== groupId);
      }
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatuses: (state, { payload }) => {
      const { status, errorMessage } = payload;
      state.savingStatus = status;
      state.errorMessage = errorMessage;
    },
    updateExperimentConfigurationSuccess: (state, { payload }) => {
      const { configuration } = payload;
      const experimentConfigurationState = state.groupConfigurations.experimentGroupConfigurations;
      const configurationIdx = experimentConfigurationState.findIndex(
        (conf) => configuration.id === conf.id,
      );

      if (configurationIdx !== -1) {
        experimentConfigurationState[configurationIdx] = configuration;
      } else {
        state.groupConfigurations.experimentGroupConfigurations = [
          ...experimentConfigurationState,
          configuration,
        ];
      }
    },
    deleteExperimentConfigurationSuccess: (state, { payload }) => {
      const { configurationId } = payload;
      const filteredGroups = state.groupConfigurations.experimentGroupConfigurations.filter(
        (configuration) => configuration.id !== configurationId,
      );
      state.groupConfigurations.experimentGroupConfigurations = filteredGroups;
    },
  },
});

export const {
  fetchGroupConfigurations,
  updateLoadingStatus,
  updateSavingStatuses,
  updateGroupConfigurationsSuccess,
  deleteGroupConfigurationsSuccess,
  updateExperimentConfigurationSuccess,
  deleteExperimentConfigurationSuccess,
} = slice.actions;

export const { reducer } = slice;
