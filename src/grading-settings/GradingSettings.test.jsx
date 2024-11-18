import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import gradingSettings from './__mocks__/gradingSettings';
import { getCourseSettingsApiUrl, getGradingSettingsApiUrl } from './data/api';
import * as apiHooks from './data/apiHooks';
import GradingSettings from './GradingSettings';
import messages from './messages';

const courseId = '123';
let axiosMock;
let store;

const queryClient = new QueryClient();

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <GradingSettings intl={injectIntl} courseId={courseId} />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<GradingSettings />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3, username: 'abc123', administrator: true, roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getGradingSettingsApiUrl(courseId))
      .reply(200, gradingSettings);
    axiosMock
      .onPost(getGradingSettingsApiUrl(courseId))
      .reply(200, {});
    axiosMock.onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, {});
    render(<RootWrapper />);
  });

  function testSaving() {
    const saveBtn = screen.getByText(messages.buttonSaveText.defaultMessage);
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);
    expect(screen.getByText(messages.buttonSavingText.defaultMessage)).toBeInTheDocument();
  }

  function setOnlineStatus(isOnline) {
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(isOnline);
    act(() => {
      window.dispatchEvent(new window.Event(isOnline ? 'online' : 'offline'));
    });
  }

  it('should render without errors', async () => {
    const gradingElements = await screen.findAllByText(messages.headingTitle.defaultMessage);
    const gradingTitle = gradingElements[0];
    expect(screen.getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    expect(gradingTitle).toBeInTheDocument();
    expect(screen.getByText(messages.policy.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.policiesDescription.defaultMessage)).toBeInTheDocument();
  });

  it('should update segment input value and show save alert', async () => {
    const segmentInputs = await screen.findAllByTestId('grading-scale-segment-input');
    expect(segmentInputs).toHaveLength(5);
    const segmentInput = segmentInputs[1];
    fireEvent.change(segmentInput, { target: { value: 'Test' } });
    expect(segmentInput).toHaveValue('Test');
    expect(screen.getByTestId('grading-settings-save-alert')).toBeVisible();
  });

  it('should update grading scale segment input value on change and cancel the action', async () => {
    const segmentInputs = await screen.findAllByTestId('grading-scale-segment-input');
    const segmentInput = segmentInputs[1];
    fireEvent.change(segmentInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(messages.buttonCancelText.defaultMessage));
    expect(segmentInput).toHaveValue('a');
  });

  it('should save segment input changes and display saving message', async () => {
    const segmentInputs = await screen.findAllByTestId('grading-scale-segment-input');
    const segmentInput = segmentInputs[1];
    fireEvent.change(segmentInput, { target: { value: 'Test' } });
    testSaving();
  });

  it('should handle being offline gracefully', async () => {
    setOnlineStatus(false);
    const segmentInputs = await screen.findAllByTestId('grading-scale-segment-input');
    const segmentInput = segmentInputs[1];
    fireEvent.change(segmentInput, { target: { value: 'Test' } });
    const saveBtn = screen.getByText(messages.buttonSaveText.defaultMessage);
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);
    expect(screen.getByText(/studio's having trouble saving your work/i)).toBeInTheDocument();
    expect(screen.queryByText(messages.buttonSavingText.defaultMessage)).not.toBeInTheDocument();
    setOnlineStatus(true);
    testSaving();
  });

  it('should display connection error alert when loading is denied', async () => {
    jest.spyOn(apiHooks, 'useGradingSettings').mockReturnValue({ isError: true });
    render(<RootWrapper />);
    expect(screen.getByTestId('connectionErrorAlert')).toBeInTheDocument();
  });
});
