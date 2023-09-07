import React from 'react';
import {
  render, screen, cleanup, waitFor, fireEvent, act,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import { initializeMockApp, mergeConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import StudioApiService from '../../data/services/StudioApiService';
import ExamsApiService from '../../data/services/ExamsApiService';
import initializeStore from '../../store';
import PagesAndResourcesProvider from '../PagesAndResourcesProvider';
import ProctoredExamSettings from './Settings';

const defaultProps = {
  courseId: 'course-v1%3AedX%2BDemoX%2BDemo_Course',
  onClose: () => {},
};
const IntlProctoredExamSettings = injectIntl(ProctoredExamSettings);
let store;

const intlWrapper = children => (
  <AppProvider store={store}>
    <PagesAndResourcesProvider courseId={defaultProps.courseId}>
      <IntlProvider locale="en">
        {children}
      </IntlProvider>
    </PagesAndResourcesProvider>
  </AppProvider>
);
let axiosMock;

describe('ProctoredExamSettings', () => {
  function setupApp(isAdmin = true) {
    mergeConfig({
      EXAMS_BASE_URL: 'http://exams.testing.co',
    }, 'CourseAuthoringConfig');

    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: isAdmin,
        roles: [],
      },
    });
    store = initializeStore({
      models: {
        courseApps: {
          proctoring: {},
        },
      },
    });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(
      `${ExamsApiService.getExamsBaseUrl()}/api/v1/providers`,
    ).reply(200, [
      {
        name: 'test_lti',
        verbose_name: 'LTI Provider',
      },
    ]);
    axiosMock.onGet(
      `${ExamsApiService.getExamsBaseUrl()}/api/v1/configs/course_id/${defaultProps.courseId}`,
    ).reply(200, {
      provider: null,
    });

    axiosMock.onGet(
      StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
    ).reply(200, {
      proctored_exam_settings: {
        enable_proctored_exams: true,
        allow_proctoring_opt_out: false,
        proctoring_provider: 'mockproc',
        proctoring_escalation_email: 'test@example.com',
        create_zendesk_tickets: true,
      },
      available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc', 'lti_external'],
      course_start_date: '2070-01-01T00:00:00Z',
    });
  }

  afterEach(() => {
    cleanup();
    axiosMock.reset();
  });
  beforeEach(async () => {
    setupApp();
  });

  describe('Field dependencies', () => {
    beforeEach(async () => {
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    });

    it('Updates Zendesk ticket field if proctortrack is provider', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });
      const selectElement = screen.getByDisplayValue('mockproc');
      await act(async () => {
        fireEvent.change(selectElement, { target: { value: 'proctortrack' } });
      });
      const zendeskTicketInput = screen.getByTestId('createZendeskTicketsNo');
      expect(zendeskTicketInput.checked).toEqual(true);
    });

    it('Updates Zendesk ticket field if software_secure is provider', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });
      const selectElement = screen.getByDisplayValue('mockproc');
      await act(async () => {
        fireEvent.change(selectElement, { target: { value: 'software_secure' } });
      });
      const zendeskTicketInput = screen.getByTestId('createZendeskTicketsYes');
      expect(zendeskTicketInput.checked).toEqual(true);
    });

    it('Does not update zendesk ticket field for any other provider', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });
      const selectElement = screen.getByDisplayValue('mockproc');
      await act(async () => {
        fireEvent.change(selectElement, { target: { value: 'mockproc' } });
      });
      const zendeskTicketInput = screen.getByTestId('createZendeskTicketsYes');
      expect(zendeskTicketInput.checked).toEqual(true);
    });

    it('Hides all other fields when enabledProctorExam is false when first loaded', async () => {
      cleanup();
      // Overrides the handler defined in beforeEach.
      axiosMock.onGet(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(200, {
        proctored_exam_settings: {
          enable_proctored_exams: false,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'mockproc',
          proctoring_escalation_email: 'test@example.com',
          create_zendesk_tickets: true,
        },
        available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
        course_start_date: '2070-01-01T00:00:00Z',
      });

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      await waitFor(() => {
        screen.getByText('Proctored exams');
      });
      const enabledProctoredExamCheck = screen.getByLabelText('Proctored exams');
      expect(enabledProctoredExamCheck.checked).toEqual(false);
      expect(screen.queryByText('Allow Opting Out of Proctored Exams')).toBeNull();
      expect(screen.queryByDisplayValue('mockproc')).toBeNull();
      expect(screen.queryByTestId('escalationEmail')).toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsYes')).toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsNo')).toBeNull();
    });

    it('Hides all other fields when enableProctoredExams toggled to false', async () => {
      await waitFor(() => {
        screen.getByText('Proctored exams');
      });
      expect(screen.queryByText('Allow opting out of proctored exams')).toBeDefined();
      expect(screen.queryByDisplayValue('mockproc')).toBeDefined();
      expect(screen.queryByTestId('escalationEmail')).toBeDefined();
      expect(screen.queryByTestId('createZendeskTicketsYes')).toBeDefined();
      expect(screen.queryByTestId('createZendeskTicketsNo')).toBeDefined();

      let enabledProctoredExamCheck = screen.getAllByLabelText('Proctored exams', { exact: false })[0];
      expect(enabledProctoredExamCheck.checked).toEqual(true);
      await act(async () => {
        fireEvent.click(enabledProctoredExamCheck, { target: { value: false } });
      });
      enabledProctoredExamCheck = screen.getByLabelText('Proctored exams');
      expect(enabledProctoredExamCheck.checked).toEqual(false);
      expect(screen.queryByText('Allow opting out of proctored exams')).toBeNull();
      expect(screen.queryByDisplayValue('mockproc')).toBeNull();
      expect(screen.queryByTestId('escalationEmail')).toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsYes')).toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsNo')).toBeNull();
    });

    it('Hides unsupported fields when lti provider is selected', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });
      const selectElement = screen.getByDisplayValue('mockproc');
      await act(async () => {
        fireEvent.change(selectElement, { target: { value: 'test_lti' } });
      });
      expect(screen.queryByTestId('escalationEmail')).toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsYes')).toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsNo')).toBeNull();
    });
  });

  describe('Validation with invalid escalation email', () => {
    beforeEach(async () => {
      axiosMock.onGet(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(200, {
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'proctortrack',
          proctoring_escalation_email: 'test@example.com',
          create_zendesk_tickets: true,
        },
        available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
        course_start_date: '2070-01-01T00:00:00Z',
      });

      axiosMock.onPost(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(200, {});

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    });

    it('Creates an alert when no proctoring escalation email is provided with proctortrack selected', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const selectEscalationEmailElement = screen.getByDisplayValue('test@example.com');
      await act(async () => {
        fireEvent.change(selectEscalationEmailElement, { target: { value: '' } });
      });
      const selectButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(selectButton);
      });

      // verify alert content and focus management
      const escalationEmailError = screen.getByTestId('proctortrackEscalationEmailError');
      expect(escalationEmailError.textContent).not.toBeNull();
      expect(document.activeElement).toEqual(escalationEmailError);

      // verify alert link links to offending input
      const errorLink = screen.getByTestId('proctorTrackEscalationEmailErrorLink');
      await act(async () => {
        fireEvent.click(errorLink);
      });
      const escalationEmailInput = screen.getByTestId('escalationEmail');
      expect(document.activeElement).toEqual(escalationEmailInput);
    });

    it('Creates an alert when invalid proctoring escalation email is provided with proctortrack selected', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const selectEscalationEmailElement = screen.getByDisplayValue('test@example.com');
      await act(async () => {
        fireEvent.change(selectEscalationEmailElement, { target: { value: 'foo.bar' } });
      });
      const selectButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(selectButton);
      });

      // verify alert content and focus management
      const escalationEmailError = screen.getByTestId('proctortrackEscalationEmailError');
      expect(document.activeElement).toEqual(escalationEmailError);
      expect(escalationEmailError.textContent).not.toBeNull();
      expect(document.activeElement).toEqual(escalationEmailError);

      // verify alert link links to offending input
      const errorLink = screen.getByTestId('proctorTrackEscalationEmailErrorLink');
      await act(async () => {
        fireEvent.click(errorLink);
      });
      const escalationEmailInput = screen.getByTestId('escalationEmail');
      expect(document.activeElement).toEqual(escalationEmailInput);
    });

    it('Creates an alert when invalid proctoring escalation email is provided with proctoring disabled', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const selectEscalationEmailElement = screen.getByDisplayValue('test@example.com');
      await act(async () => {
        fireEvent.change(selectEscalationEmailElement, { target: { value: 'foo.bar' } });
      });
      const enableProctoringElement = screen.getByText('Proctored exams');
      await act(async () => fireEvent.click(enableProctoringElement));
      const selectButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(selectButton);
      });

      // verify alert content and focus management
      const escalationEmailError = screen.getByTestId('proctortrackEscalationEmailError');
      expect(document.activeElement).toEqual(escalationEmailError);
      expect(escalationEmailError.textContent).not.toBeNull();
      expect(document.activeElement).toEqual(escalationEmailError);
    });

    it('Has no error when invalid proctoring escalation email is provided with proctoring disabled', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const selectEscalationEmailElement = screen.getByDisplayValue('test@example.com');
      await act(async () => {
        fireEvent.change(selectEscalationEmailElement, { target: { value: '' } });
      });
      const enableProctoringElement = screen.getByText('Proctored exams');
      await act(async () => fireEvent.click(enableProctoringElement));
      const selectButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(selectButton);
      });

      // verify there is no escalation email alert, and focus has been set on save success alert
      expect(screen.queryByTestId('proctortrackEscalationEmailError')).toBeNull();

      const errorAlert = screen.getByTestId('saveSuccess');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Has no error when valid proctoring escalation email is provided with proctortrack selected', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const selectEscalationEmailElement = screen.getByDisplayValue('test@example.com');
      await act(async () => {
        fireEvent.change(selectEscalationEmailElement, { target: { value: 'foo@bar.com' } });
      });
      const selectButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(selectButton);
      });

      // verify there is no escalation email alert, and focus has been set on save success alert
      expect(screen.queryByTestId('proctortrackEscalationEmailError')).toBeNull();

      const errorAlert = screen.getByTestId('saveSuccess');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Escalation email field hidden when proctoring backend is not Proctortrack', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const proctoringBackendSelect = screen.getByDisplayValue('proctortrack');
      const selectEscalationEmailElement = screen.getByTestId('escalationEmail');
      expect(selectEscalationEmailElement.value).toEqual('test@example.com');
      await act(async () => {
        fireEvent.change(proctoringBackendSelect, { target: { value: 'software_secure' } });
      });
      expect(screen.queryByTestId('escalationEmail')).toBeNull();
    });

    it('Escalation email Field Show when proctoring backend is switched back to Proctortrack', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const proctoringBackendSelect = screen.getByDisplayValue('proctortrack');
      let selectEscalationEmailElement = screen.getByTestId('escalationEmail');
      await act(async () => {
        fireEvent.change(proctoringBackendSelect, { target: { value: 'software_secure' } });
      });
      expect(screen.queryByTestId('escalationEmail')).toBeNull();
      await act(async () => {
        fireEvent.change(proctoringBackendSelect, { target: { value: 'proctortrack' } });
      });
      expect(screen.queryByTestId('escalationEmail')).toBeDefined();
      selectEscalationEmailElement = screen.getByTestId('escalationEmail');
      expect(selectEscalationEmailElement.value).toEqual('test@example.com');
    });

    it('Submits form when "Enter" key is hit in the escalation email field', async () => {
      await waitFor(() => {
        screen.getByDisplayValue('proctortrack');
      });
      const selectEscalationEmailElement = screen.getByDisplayValue('test@example.com');
      await act(async () => {
        fireEvent.change(selectEscalationEmailElement, { target: { value: '' } });
      });
      await act(async () => {
        fireEvent.submit(selectEscalationEmailElement);
      });
      // if the error appears, the form has been submitted
      expect(screen.getByTestId('proctortrackEscalationEmailError')).toBeDefined();
    });
  });

  describe('Proctoring provider options', () => {
    const mockGetFutureCourseData = {
      proctored_exam_settings: {
        enable_proctored_exams: true,
        allow_proctoring_opt_out: false,
        proctoring_provider: 'mockproc',
        proctoring_escalation_email: 'test@example.com',
        create_zendesk_tickets: true,
      },
      available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
      course_start_date: '2099-01-01T00:00:00Z',
    };

    const mockGetPastCourseData = {
      proctored_exam_settings: {
        enable_proctored_exams: true,
        allow_proctoring_opt_out: false,
        proctoring_provider: 'mockproc',
        proctoring_escalation_email: 'test@example.com',
        create_zendesk_tickets: true,
      },
      available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
      course_start_date: '2013-01-01T00:00:00Z',
    };

    function mockCourseData(data) {
      axiosMock.onGet(StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId)).reply(200, data);
    }

    it('Disables irrelevant proctoring provider fields when user is not an administrator and it is after start date', async () => {
      const isAdmin = false;
      setupApp(isAdmin);
      mockCourseData(mockGetPastCourseData);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const providerOption = screen.getByTestId('proctortrack');
      expect(providerOption.hasAttribute('disabled')).toEqual(true);
    });

    it('Enables all proctoring provider options if user is not an administrator and it is before start date', async () => {
      const isAdmin = false;
      setupApp(isAdmin);
      mockCourseData(mockGetFutureCourseData);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const providerOption = screen.getByTestId('proctortrack');
      expect(providerOption.hasAttribute('disabled')).toEqual(false);
    });

    it('Enables all proctoring provider options if user administrator and it is after start date', async () => {
      const isAdmin = true;
      setupApp(isAdmin);
      mockCourseData(mockGetPastCourseData);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const providerOption = screen.getByTestId('proctortrack');
      expect(providerOption.hasAttribute('disabled')).toEqual(false);
    });

    it('Enables all proctoring provider options if user administrator and it is before start date', async () => {
      const isAdmin = true;
      setupApp(isAdmin);
      mockCourseData(mockGetFutureCourseData);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const providerOption = screen.getByTestId('proctortrack');
      expect(providerOption.hasAttribute('disabled')).toEqual(false);
    });

    it('Does not include lti_external as a selectable option', async () => {
      const courseData = {
        ...mockGetFutureCourseData,
        available_proctoring_providers: ['lti_external', 'proctortrack', 'mockproc'],
      };
      mockCourseData(courseData);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });
      expect(screen.queryByTestId('lti_external')).toBeNull();
    });

    it('Includes lti proctoring provider options when lti_external is allowed by studio', async () => {
      const courseData = {
        ...mockGetFutureCourseData,
        available_proctoring_providers: ['lti_external', 'proctortrack', 'mockproc'],
      };
      mockCourseData(courseData);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });
      const providerOption = screen.getByTestId('test_lti');
      // as as admin the provider should not be disabled
      expect(providerOption.hasAttribute('disabled')).toEqual(false);
    });

    it('Does not include lti provider options when lti_external is not available in studio', async () => {
      const isAdmin = true;
      setupApp(isAdmin);
      mockCourseData(mockGetFutureCourseData);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });

      const providerOption = screen.queryByTestId('test_lti');
      expect(providerOption).not.toBeInTheDocument();
    });

    it('Does not request lti provider options if there is no exam service url configuration', async () => {
      mergeConfig({
        EXAMS_BASE_URL: null,
      }, 'CourseAuthoringConfig');

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      await waitFor(() => {
        screen.getByDisplayValue('mockproc');
      });
      // only outgoing request should be for studio settings
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url.includes('proctored_exam_settings')).toEqual(true);
    });

    it('Selected LTI proctoring provider is shown on page load', async () => {
      const courseData = { ...mockGetFutureCourseData };
      courseData.available_proctoring_providers = ['lti_external', 'proctortrack', 'mockproc'];
      courseData.proctored_exam_settings.proctoring_provider = 'lti_external';
      mockCourseData(courseData);
      axiosMock.onGet(
        `${ExamsApiService.getExamsBaseUrl()}/api/v1/configs/course_id/${defaultProps.courseId}`,
      ).reply(200, {
        provider: 'test_lti',
      });
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      await waitFor(() => {
        screen.getByText('Proctoring provider');
      });

      // make sure test_lti is the selected provider
      expect(screen.getByDisplayValue('LTI Provider')).toBeInTheDocument();
    });
  });

  describe('Toggles field visibility based on user permissions', () => {
    it('Hides opting out and zendesk tickets for non edX staff', async () => {
      setupApp(false);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      expect(screen.queryByTestId('allowOptingOutYes')).toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsYes')).toBeNull();
    });

    it('Shows opting out and zendesk tickets for edX staff', async () => {
      setupApp(true);
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      expect(screen.queryByTestId('allowOptingOutYes')).not.toBeNull();
      expect(screen.queryByTestId('createZendeskTicketsYes')).not.toBeNull();
    });
  });

  describe('Connection states', () => {
    it('Shows the spinner before the connection is complete', async () => {
      await act(async () => {
        render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />));
        // This expectation is _inside_ the `act` intentionally, so that it executes immediately.
        const spinner = screen.getByRole('status');
        expect(spinner.textContent).toEqual('Loading...');
      });
    });

    it('Show connection error message when we suffer studio server side error', async () => {
      axiosMock.onGet(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(500);

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const connectionError = screen.getByTestId('connectionErrorAlert');
      expect(connectionError.textContent).toEqual(
        expect.stringContaining('We encountered a technical error when loading this page.'),
      );
    });

    it('Show connection error message when we suffer edx-exams server side error', async () => {
      axiosMock.onGet(
        `${ExamsApiService.getExamsBaseUrl()}/api/v1/providers`,
      ).reply(500);

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const connectionError = screen.getByTestId('connectionErrorAlert');
      expect(connectionError.textContent).toEqual(
        expect.stringContaining('We encountered a technical error when loading this page.'),
      );
    });

    it('Show permission error message when user do not have enough permission', async () => {
      axiosMock.onGet(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(403);

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const permissionError = screen.getByTestId('permissionDeniedAlert');
      expect(permissionError.textContent).toEqual(
        expect.stringContaining('You are not authorized to view this page'),
      );
    });
  });

  describe('Save settings', () => {
    beforeEach(async () => {
      axiosMock.onPost(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(200, 'success');
      axiosMock.onPatch(
        `${ExamsApiService.getExamsBaseUrl()}/api/v1/configs/course_id/${defaultProps.courseId}`,
      ).reply(200, 'success');
    });

    it('Disable button while submitting', async () => {
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      let submitButton = screen.getByTestId('submissionButton');
      expect(screen.queryByTestId('saveInProgress')).toBeFalsy();
      act(() => {
        fireEvent.click(submitButton);
      });

      submitButton = screen.getByTestId('submissionButton');
      expect(submitButton).toHaveAttribute('disabled');
    });

    it('Makes API call successfully with proctoring_escalation_email if proctortrack', async () => {
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      // Make a change to the provider to proctortrack and set the email
      const selectElement = screen.getByDisplayValue('mockproc');
      await act(async () => {
        fireEvent.change(selectElement, { target: { value: 'proctortrack' } });
      });
      const escalationEmail = screen.getByTestId('escalationEmail');
      expect(escalationEmail.value).toEqual('test@example.com');
      await act(async () => {
        fireEvent.change(escalationEmail, { target: { value: 'proctortrack@example.com' } });
      });
      expect(escalationEmail.value).toEqual('proctortrack@example.com');
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      expect(axiosMock.history.post.length).toBe(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'proctortrack',
          proctoring_escalation_email: 'proctortrack@example.com',
          create_zendesk_tickets: false,
        },
      });

      const errorAlert = screen.getByTestId('saveSuccess');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Makes API call successfully without proctoring_escalation_email if not proctortrack', async () => {
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));

      // make sure we have not selected proctortrack as the proctoring provider
      expect(screen.getByDisplayValue('mockproc')).toBeDefined();

      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      expect(axiosMock.history.post.length).toBe(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'mockproc',
          create_zendesk_tickets: true,
        },
      });

      const errorAlert = screen.getByTestId('saveSuccess');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Successfully updates exam configuration and studio provider is set to "lti_external" for lti providers', async () => {
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      // Make a change to the provider to proctortrack and set the email
      const selectElement = screen.getByDisplayValue('mockproc');
      await act(async () => {
        fireEvent.change(selectElement, { target: { value: 'test_lti' } });
      });
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // update exam service config
      expect(axiosMock.history.patch.length).toBe(1);
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        provider: 'test_lti',
      });

      // update studio settings
      expect(axiosMock.history.post.length).toBe(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'lti_external',
          create_zendesk_tickets: true,
        },
      });

      const errorAlert = screen.getByTestId('saveSuccess');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Sets exam service provider to null if a non-lti provider is selected', async () => {
      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      // update exam service config
      expect(axiosMock.history.patch.length).toBe(1);
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        provider: null,
      });
      expect(axiosMock.history.patch.length).toBe(1);
      expect(axiosMock.history.post.length).toBe(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'mockproc',
          create_zendesk_tickets: true,
        },
      });

      const errorAlert = screen.getByTestId('saveSuccess');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Does not update exam service if lti is not enabled in studio', async () => {
      axiosMock.onGet(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(200, {
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'mockproc',
          proctoring_escalation_email: 'test@example.com',
          create_zendesk_tickets: true,
        },
        available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
        course_start_date: '2070-01-01T00:00:00Z',
      });

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      // does not update exam service config
      expect(axiosMock.history.patch.length).toBe(0);
      // does update studio
      expect(axiosMock.history.post.length).toBe(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'mockproc',
          create_zendesk_tickets: true,
        },
      });

      const errorAlert = screen.getByTestId('saveSuccess');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Makes studio API call generated error', async () => {
      axiosMock.onPost(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(500);

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      expect(axiosMock.history.post.length).toBe(1);
      const errorAlert = screen.getByTestId('saveError');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('We encountered a technical error while trying to save proctored exam settings'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Makes exams API call generated error', async () => {
      axiosMock.onPatch(
        `${ExamsApiService.getExamsBaseUrl()}/api/v1/configs/course_id/${defaultProps.courseId}`,
      ).reply(500, 'error');

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      expect(axiosMock.history.post.length).toBe(1);
      const errorAlert = screen.getByTestId('saveError');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('We encountered a technical error while trying to save proctored exam settings'),
      );
      expect(document.activeElement).toEqual(errorAlert);
    });

    it('Manages focus correctly after different save statuses', async () => {
      // first make a call that will cause a save error
      axiosMock.onPost(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(500);

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      expect(axiosMock.history.post.length).toBe(1);
      const errorAlert = screen.getByTestId('saveError');
      expect(errorAlert.textContent).toEqual(
        expect.stringContaining('We encountered a technical error while trying to save proctored exam settings'),
      );
      expect(document.activeElement).toEqual(errorAlert);

      // now make a call that will allow for a successful save
      axiosMock.onPost(
        StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      ).reply(200, 'success');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(axiosMock.history.post.length).toBe(2);
      const successAlert = screen.getByTestId('saveSuccess');
      expect(successAlert.textContent).toEqual(
        expect.stringContaining('Proctored exam settings saved successfully.'),
      );
      expect(document.activeElement).toEqual(successAlert);
    });

    it('Include Zendesk ticket in post request if user is not an admin', async () => {
      // use non-admin user for test
      const isAdmin = false;
      setupApp(isAdmin);

      await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
      // Make a change to the proctoring provider
      const selectElement = screen.getByDisplayValue('mockproc');
      await act(async () => {
        fireEvent.change(selectElement, { target: { value: 'proctortrack' } });
      });
      const submitButton = screen.getByTestId('submissionButton');
      await act(async () => {
        fireEvent.click(submitButton);
      });
      expect(axiosMock.history.post.length).toBe(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        proctored_exam_settings: {
          enable_proctored_exams: true,
          proctoring_provider: 'proctortrack',
          proctoring_escalation_email: 'test@example.com',
          create_zendesk_tickets: false,
        },
      });
    });
  });
});
