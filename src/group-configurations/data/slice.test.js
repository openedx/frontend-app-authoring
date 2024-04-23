import {
  reducer,
  fetchGroupConfigurations,
  updateGroupConfigurationsSuccess,
  deleteGroupConfigurationsSuccess,
  updateExperimentConfigurationSuccess,
  deleteExperimentConfigurationSuccess,
} from './slice';
import { RequestStatus } from '../../data/constants';

describe('groupConfigurations slice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      savingStatus: '',
      loadingStatus: RequestStatus.IN_PROGRESS,
      groupConfigurations: {
        allGroupConfigurations: [{ id: 1, name: 'Group 1', groups: [{ id: 1, name: 'inner group' }] }],
        experimentGroupConfigurations: [],
      },
    };
  });

  it('should update group configurations with fetchGroupConfigurations', () => {
    const payload = {
      groupConfigurations: {
        allGroupConfigurations: [{ id: 2, name: 'Group 2' }],
        experimentGroupConfigurations: [],
      },
    };

    const newState = reducer(initialState, fetchGroupConfigurations(payload));

    expect(newState.groupConfigurations).toEqual(payload.groupConfigurations);
  });

  it('should update an existing group configuration with updateGroupConfigurationsSuccess', () => {
    const payload = { data: { id: 1, name: 'Updated Group' } };

    const newState = reducer(initialState, updateGroupConfigurationsSuccess(payload));

    expect(newState.groupConfigurations.allGroupConfigurations[0]).toEqual(payload.data);
  });

  it('should delete a group configuration with deleteGroupConfigurationsSuccess', () => {
    const payload = { parentGroupId: 1, groupId: 1 };

    const newState = reducer(initialState, deleteGroupConfigurationsSuccess(payload));

    expect(newState.groupConfigurations.allGroupConfigurations[0].groups.length).toEqual(0);
  });

  it('should update experiment configuration with updateExperimentConfigurationSuccess', () => {
    const payload = { configuration: { id: 1, name: 'Experiment Config' } };

    const newState = reducer(initialState, updateExperimentConfigurationSuccess(payload));

    expect(newState.groupConfigurations.experimentGroupConfigurations.length).toEqual(1);
    expect(newState.groupConfigurations.experimentGroupConfigurations[0]).toEqual(payload.configuration);
  });

  it('should delete an experiment configuration with deleteExperimentConfigurationSuccess', () => {
    const initialStateWithExperiment = {
      savingStatus: '',
      loadingStatus: RequestStatus.IN_PROGRESS,
      groupConfigurations: {
        allGroupConfigurations: [],
        experimentGroupConfigurations: [{ id: 1, name: 'Experiment Config' }],
      },
    };
    const payload = { configurationId: 1 };

    const newState = reducer(initialStateWithExperiment, deleteExperimentConfigurationSuccess(payload));

    expect(newState.groupConfigurations.experimentGroupConfigurations.length).toEqual(0);
  });
});
