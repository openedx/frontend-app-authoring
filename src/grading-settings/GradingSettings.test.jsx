import React from 'react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { render, waitFor, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import { getGradingSettingsApiUrl } from './data/api';
import gradingSettings from './__mocks__/gradingSettings';
import GradingSettings from './GradingSettings';
import messages from './messages';

import { getUserPermissionsUrl, getUserPermissionsEnabledFlagUrl } from '../generic/data/api';
import { fetchUserPermissionsQuery, fetchUserPermissionsEnabledFlag } from '../generic/data/thunks';
import { executeThunk } from '../utils';

const courseId = '123';
const userId = 3;
let axiosMock;
let store;
let userPermissionsData = { permissions: [] };

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <GradingSettings intl={injectIntl} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<GradingSettings />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getGradingSettingsApiUrl(courseId))
      .reply(200, gradingSettings);
    axiosMock
      .onGet(getUserPermissionsEnabledFlagUrl)
      .reply(200, { enabled: false });
    axiosMock
      .onGet(getUserPermissionsUrl(courseId, userId))
      .reply(200, userPermissionsData);
    executeThunk(fetchUserPermissionsQuery(courseId), store.dispatch);
    executeThunk(fetchUserPermissionsEnabledFlag(), store.dispatch);
  });

  it('should render without errors', async () => {
    const { getByText, getAllByText } = render(<RootWrapper />);
    await waitFor(() => {
      const gradingElements = getAllByText(messages.headingTitle.defaultMessage);
      const gradingTitle = gradingElements[0];
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(gradingTitle).toBeInTheDocument();
      expect(getByText(messages.policy.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.policiesDescription.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should render permissionDenied if incorrect permissions', async () => {
    const { getByTestId } = render(<RootWrapper />);
    axiosMock.onGet(getUserPermissionsEnabledFlagUrl).reply(200, { enabled: true });
    await executeThunk(fetchUserPermissionsEnabledFlag(), store.dispatch);
    expect(getByTestId('permissionDeniedAlert')).toBeVisible();
  });

  it('should update segment input value and show save alert', async () => {
    const { getByTestId, getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const segmentInputs = getAllByTestId('grading-scale-segment-input');
      expect(segmentInputs).toHaveLength(5);
      const segmentInput = segmentInputs[1];
      fireEvent.change(segmentInput, { target: { value: 'Test' } });
      expect(segmentInput).toHaveValue('Test');
      expect(getByTestId('grading-settings-save-alert')).toBeVisible();
    });
  });

  it('should update grading scale segment input value on change and cancel the action', async () => {
    const { getByText, getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const segmentInputs = getAllByTestId('grading-scale-segment-input');
      const segmentInput = segmentInputs[1];
      fireEvent.change(segmentInput, { target: { value: 'Test' } });
      fireEvent.click(getByText(messages.buttonCancelText.defaultMessage));
      expect(segmentInput).toHaveValue('a');
    });
  });

  it('should save segment input changes and display saving message', async () => {
    const { getByText, getAllByTestId } = render(<RootWrapper />);
    await waitFor(() => {
      const segmentInputs = getAllByTestId('grading-scale-segment-input');
      const segmentInput = segmentInputs[1];
      fireEvent.change(segmentInput, { target: { value: 'Test' } });
      const saveBtn = getByText(messages.buttonSaveText.defaultMessage);
      expect(saveBtn).toBeInTheDocument();
      fireEvent.click(saveBtn);
      expect(getByText(messages.buttonSavingText.defaultMessage)).toBeInTheDocument();
    });
  });
});
