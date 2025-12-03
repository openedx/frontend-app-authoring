import {
  act, fireEvent, render, screen, initializeMocks,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

import gradingSettings from './__mocks__/gradingSettings';
import { getCourseSettingsApiUrl, getGradingSettingsApiUrl } from './data/api';
import * as apiHooks from './data/apiHooks';
import GradingSettings from './GradingSettings';
import messages from './messages';

const courseId = '123';
let axiosMock;
let store;

const RootWrapper = () => (
  <CourseAuthoringProvider courseId={courseId}> 
    <GradingSettings />
  </CourseAuthoringProvider>
);

describe('<GradingSettings />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();

    // jsdom doesn't implement scrollTo; mock to avoid noisy console errors.
    Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });

    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
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

  it('should show success alert and hide save prompt after successful save', async () => {
    // Trigger change to show save prompt
    const segmentInputs = await screen.findAllByTestId('grading-scale-segment-input');
    const segmentInput = segmentInputs[2];
    fireEvent.change(segmentInput, { target: { value: 'PatchTest' } });
    // Click save and verify pending state appears
    const saveBtnInitial = screen.getByText(messages.buttonSaveText.defaultMessage);
    fireEvent.click(saveBtnInitial);
    expect(screen.getByText(messages.buttonSavingText.defaultMessage)).toBeInTheDocument();
    // Wait for success alert to appear (mutation success)
    const successAlert = await screen.findByText(messages.alertSuccess.defaultMessage);
    expect(successAlert).toBeVisible();
    // Pending label should disappear and save prompt should be hidden (button removed)
    expect(screen.queryByText(messages.buttonSavingText.defaultMessage)).toBeNull();
    const saveAlert = screen.queryByTestId('grading-settings-save-alert');
    expect(saveAlert).toBeNull();
    // Ensure original save button text is no longer present because the prompt closed
    expect(screen.queryByText(messages.buttonSaveText.defaultMessage)).toBeNull();
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
