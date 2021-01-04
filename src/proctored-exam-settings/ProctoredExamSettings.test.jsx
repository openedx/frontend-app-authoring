import React from 'react';
import {
  render, screen, cleanup, waitFor, waitForElementToBeRemoved, fireEvent, act,
} from '@testing-library/react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import * as auth from '@edx/frontend-platform/auth';
import ProctoredExamSettings from './ProctoredExamSettings';
import StudioApiService from '../data/services/StudioApiService';

const defaultProps = {
  courseId: 'course-v1%3AedX%2BDemoX%2BDemo_Course',
};

const IntlProctoredExamSettings = injectIntl(ProctoredExamSettings);

const intlWrapper = children => (
  <IntlProvider locale="en">
    {children}
  </IntlProvider>
);

describe('ProctoredExamSettings field dependency tests', () => {
  beforeEach(async () => {
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: async () => ({
        data: {
          proctored_exam_settings: {
            enable_proctored_exams: true,
            allow_proctoring_opt_out: false,
            proctoring_provider: 'mockproc',
            proctoring_escalation_email: 'test@example.com',
            create_zendesk_tickets: true,
          },
          available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
          course_start_date: '2070-01-01T00:00:00Z',
        },
      }),
    }));

    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, administrator: true }));
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
  });

  afterEach(() => {
    cleanup();
  });

  it('updates zendesk ticket field if proctortrack is provider', async () => {
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

  it('updates zendesk ticket field if software_secure is provider', async () => {
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

  it('does not update zendesk ticket field for any other provider', async () => {
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
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: async () => ({
        data: {
          proctored_exam_settings: {
            enable_proctored_exams: false,
            allow_proctoring_opt_out: false,
            proctoring_provider: 'mockproc',
            proctoring_escalation_email: 'test@example.com',
            create_zendesk_tickets: true,
          },
          available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
          course_start_date: '2070-01-01T00:00:00Z',
        },
      }),
    }));

    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    await waitFor(() => {
      screen.getByLabelText('Enable Proctored Exams');
    });
    const enabledProctoredExamCheck = screen.getByLabelText('Enable Proctored Exams');
    expect(enabledProctoredExamCheck.checked).toEqual(false);
    expect(screen.queryByText('Allow Opting Out of Proctored Exams')).toBeNull();
    expect(screen.queryByDisplayValue('mockproc')).toBeNull();
    expect(screen.queryByTestId('escalationEmail')).toBeNull();
    expect(screen.queryByTestId('createZendeskTicketsYes')).toBeNull();
    expect(screen.queryByTestId('createZendeskTicketsNo')).toBeNull();
  });

  it('Hides all other fields when enableProctoredExams toggled to false', async () => {
    await waitFor(() => {
      screen.getByLabelText('Enable Proctored Exams');
    });
    expect(screen.queryByText('Allow Opting Out of Proctored Exams')).toBeDefined();
    expect(screen.queryByDisplayValue('mockproc')).toBeDefined();
    expect(screen.queryByTestId('escalationEmail')).toBeDefined();
    expect(screen.queryByTestId('createZendeskTicketsYes')).toBeDefined();
    expect(screen.queryByTestId('createZendeskTicketsNo')).toBeDefined();

    let enabledProctorExamCheck = screen.getByLabelText('Enable Proctored Exams');
    expect(enabledProctorExamCheck.checked).toEqual(true);
    await act(async () => {
      fireEvent.click(enabledProctorExamCheck, { target: { value: false } });
    });
    enabledProctorExamCheck = screen.getByLabelText('Enable Proctored Exams');
    expect(enabledProctorExamCheck.checked).toEqual(false);
    expect(screen.queryByText('Allow Opting Out of Proctored Exams')).toBeNull();
    expect(screen.queryByDisplayValue('mockproc')).toBeNull();
    expect(screen.queryByTestId('escalationEmail')).toBeNull();
    expect(screen.queryByTestId('createZendeskTicketsYes')).toBeNull();
    expect(screen.queryByTestId('createZendeskTicketsNo')).toBeNull();
  });
});

describe('ProctoredExamSettings validation with invalid escalation email', () => {
  beforeEach(async () => {
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: async () => ({
        data: {
          proctored_exam_settings: {
            enable_proctored_exams: true,
            allow_proctoring_opt_out: false,
            proctoring_provider: 'proctortrack',
            proctoring_escalation_email: 'test@example.com',
            create_zendesk_tickets: true,
          },
          available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
          course_start_date: '2070-01-01T00:00:00Z',
        },
      }),
      post: async () => {},
    }));

    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, administrator: false }));
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
  });

  afterEach(() => {
    cleanup();
  });

  it('creates an alert when no proctoring escalation email is provided with proctortrack selected', async () => {
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
    fireEvent.click(errorLink);
    const escalationEmailInput = screen.getByTestId('escalationEmail');
    expect(document.activeElement).toEqual(escalationEmailInput);
  });

  it('creates an alert when invalid proctoring escalation email is provided with proctortrack selected', async () => {
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
    fireEvent.click(errorLink);
    const escalationEmailInput = screen.getByTestId('escalationEmail');
    expect(document.activeElement).toEqual(escalationEmailInput);
  });

  it('has no error when valid proctoring escalation email is provided with proctortrack selected', async () => {
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

  it('Escalation Email field hidden when proctoring backend is not Proctortrack', async () => {
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

  it('Escalation Email Field Show when proctoring backend is switched back to Proctortrack', async () => {
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

  it('submits form when "Enter" key is hit in the escalation email field', async () => {
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

describe('Disables proctoring provider options', () => {
  const mockGetFutureCourseData = {
    data: {
      proctored_exam_settings: {
        enable_proctored_exams: true,
        allow_proctoring_opt_out: false,
        proctoring_provider: 'mockproc',
        proctoring_escalation_email: 'test@example.com',
        create_zendesk_tickets: true,
      },
      available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
      course_start_date: '2099-01-01T00:00:00Z',
    },
  };

  const mockGetPastCourseData = {
    data: {
      proctored_exam_settings: {
        enable_proctored_exams: true,
        allow_proctoring_opt_out: false,
        proctoring_provider: 'mockproc',
        proctoring_escalation_email: 'test@example.com',
        create_zendesk_tickets: true,
      },
      available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
      course_start_date: '2013-01-01T00:00:00Z',
    },
  };

  function mockAPI(getData, isAdmin) {
    const mockClientGet = jest.fn(async () => (getData));
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: mockClientGet,
    }));
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, administrator: isAdmin }));
  }

  afterEach(() => {
    cleanup();
  });

  it('disables irrelevant Proctoring Provider fields when user is not an administrator and it is after start date', async () => {
    mockAPI(mockGetPastCourseData, false);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const providerOption = screen.getByTestId('proctortrack');
    expect(providerOption.hasAttribute('disabled')).toEqual(true);
  });

  it('enables all Proctoring Provider options if user is not an administrator and it is before start date', async () => {
    mockAPI(mockGetFutureCourseData, false);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const providerOption = screen.getByTestId('proctortrack');
    expect(providerOption.hasAttribute('disabled')).toEqual(false);
  });

  it('enables all Proctoring Provider options if user administrator and it is after start date', async () => {
    mockAPI(mockGetPastCourseData, true);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const providerOption = screen.getByTestId('proctortrack');
    expect(providerOption.hasAttribute('disabled')).toEqual(false);
  });

  it('enables all Proctoring Provider options if user administrator and it is before start date', async () => {
    mockAPI(mockGetFutureCourseData, true);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const providerOption = screen.getByTestId('proctortrack');
    expect(providerOption.hasAttribute('disabled')).toEqual(false);
  });
});

describe('Hides fields based on user permissions', () => {
  beforeEach(async () => {
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: async () => ({
        data: {
          proctored_exam_settings: {
            enable_proctored_exams: true,
            allow_proctoring_opt_out: false,
            proctoring_provider: 'mockproc',
            proctoring_escalation_email: 'test@example.com',
            create_zendesk_tickets: true,
          },
          available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
          course_start_date: '2070-01-01T00:00:00Z',
        },
        catch: () => {},
      }),
    }));
  });

  afterEach(() => {
    cleanup();
  });

  function mockAuthentication(isAdmin) {
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, administrator: isAdmin }));
  }

  it('hides opting out and zendesk tickets for non edX staff', async () => {
    mockAuthentication(false);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    expect(screen.queryByTestId('allowOptingOutYes')).toBeNull();
    expect(screen.queryByTestId('createZendeskTicketsYes')).toBeNull();
  });

  it('shows opting out and zendesk tickets for edX staff', async () => {
    mockAuthentication(true);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    expect(screen.queryByTestId('allowOptingOutYes')).not.toBeNull();
    expect(screen.queryByTestId('createZendeskTicketsYes')).not.toBeNull();
  });
});

describe('ProctoredExamSettings connection states tests', () => {
  it('shows the spinner before the connection is complete', async () => {
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, administrator: false }));
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: jest.fn(() => new Promise(() => {})),
    }));
    render(<IntlProvider locale="en"><IntlProctoredExamSettings {...defaultProps} /></IntlProvider>);
    const spinner = screen.getByTestId('spinnerContainer');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('show connection error message when we suffer server side error', async () => {
    const errorObject = {
      customAttributes: {
        httpErrorStatus: 500,
      },
    };
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: async () => {
        throw errorObject;
      },
    }));

    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const connectionError = screen.getByTestId('connectionError');
    expect(connectionError.textContent).toEqual(
      expect.stringContaining('We encountered a technical error'),
    );
  });

  it('show permission error message when user do not have enough permission', async () => {
    const errorObject = {
      customAttributes: {
        httpErrorStatus: 403,
      },
    };
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: async () => {
        throw errorObject;
      },
    }));

    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const connectionError = screen.getByTestId('permissionError');
    expect(connectionError.textContent).toEqual(
      expect.stringContaining('You are not authorized to view this page'),
    );
  });

  afterEach(() => {
    cleanup();
  });
});

describe('ProctoredExamSettings save settings tests', () => {
  const mockGetData = {
    data: {
      proctored_exam_settings: {
        enable_proctored_exams: true,
        allow_proctoring_opt_out: false,
        proctoring_provider: 'mockproc',
        proctoring_escalation_email: 'test@example.com',
        create_zendesk_tickets: true,
      },
      available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
    },
  };

  function mockAPI(getData, postResult) {
    const mockClientGet = jest.fn(async () => (getData));
    const mockClientPost = postResult ? jest.fn(async () => (postResult)) : jest.fn(async () => { throw new Error(); });
    auth.getAuthenticatedHttpClient = jest.fn(() => ({
      get: mockClientGet,
      post: mockClientPost,
    }));
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, administrator: true }));
    return { mockClientGet, mockClientPost };
  }

  it('Show spinner while saving', async () => {
    const mockedFunctions = mockAPI(mockGetData, { data: 'success' });
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const submitButton = screen.getByTestId('submissionButton');
    expect(screen.queryByTestId('saveInProgress')).toBeFalsy();
    fireEvent.click(submitButton);
    const submitSpinner = screen.getByTestId('saveInProgress');
    expect(submitSpinner).toBeDefined();
    expect(mockedFunctions.mockClientPost).toHaveBeenCalled();
    await waitForElementToBeRemoved(submitSpinner);
    expect(screen.queryByTestId('saveInProgress')).toBeFalsy();
  });

  it('Makes API call successfully with proctoring_escalation_email if proctortrack', async () => {
    const mockedFunctions = mockAPI(mockGetData, { data: 'success' });
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
    expect(mockedFunctions.mockClientPost).toHaveBeenCalled();
    expect(mockedFunctions.mockClientPost).toHaveBeenCalledWith(
      StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      {
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'proctortrack',
          proctoring_escalation_email: 'proctortrack@example.com',
          create_zendesk_tickets: false,
        },
      },
    );
    const errorAlert = screen.getByTestId('saveSuccess');
    expect(errorAlert.textContent).toEqual(
      expect.stringContaining('Proctored exam settings saved successfully.'),
    );
    expect(document.activeElement).toEqual(errorAlert);
  });

  it('Makes API call successfully without proctoring_escalation_email if not proctortrack', async () => {
    const mockedFunctions = mockAPI(mockGetData, { data: 'success' });
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));

    // make sure we have not selected proctortrack as the proctoring provider
    expect(screen.getByDisplayValue('mockproc')).toBeDefined();

    const submitButton = screen.getByTestId('submissionButton');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(mockedFunctions.mockClientPost).toHaveBeenCalled();
    expect(mockedFunctions.mockClientPost).toHaveBeenCalledWith(
      StudioApiService.getProctoredExamSettingsUrl(defaultProps.courseId),
      {
        proctored_exam_settings: {
          enable_proctored_exams: true,
          allow_proctoring_opt_out: false,
          proctoring_provider: 'mockproc',
          create_zendesk_tickets: true,
        },
      },
    );
    const errorAlert = screen.getByTestId('saveSuccess');
    expect(errorAlert.textContent).toEqual(
      expect.stringContaining('Proctored exam settings saved successfully.'),
    );
    expect(document.activeElement).toEqual(errorAlert);
  });

  it('Makes API call generated error', async () => {
    const mockedFunctions = mockAPI(mockGetData, false);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const submitButton = screen.getByTestId('submissionButton');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(mockedFunctions.mockClientPost).toHaveBeenCalled();
    const errorAlert = screen.getByTestId('saveError');
    expect(errorAlert.textContent).toEqual(
      expect.stringContaining('We encountered a technical error while trying to save proctored exam settings'),
    );
    expect(document.activeElement).toEqual(errorAlert);
  });

  it('Manages focus correctly after different save statuses', async () => {
    // first make a call that will cause a save error
    const mockedFunctionsBadCall = mockAPI(mockGetData, false);
    await act(async () => render(intlWrapper(<IntlProctoredExamSettings {...defaultProps} />)));
    const submitButton = screen.getByTestId('submissionButton');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(mockedFunctionsBadCall.mockClientPost).toHaveBeenCalled();
    const errorAlert = screen.getByTestId('saveError');
    expect(errorAlert.textContent).toEqual(
      expect.stringContaining('We encountered a technical error while trying to save proctored exam settings'),
    );
    expect(document.activeElement).toEqual(errorAlert);

    // now make a call that will allow for a successful save
    const mockedFunctionsGoodCall = mockAPI(mockGetData, { data: 'success' });
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(mockedFunctionsGoodCall.mockClientPost).toHaveBeenCalled();
    const successAlert = screen.getByTestId('saveSuccess');
    expect(successAlert.textContent).toEqual(
      expect.stringContaining('Proctored exam settings saved successfully.'),
    );
    expect(document.activeElement).toEqual(successAlert);
  });

  afterEach(() => {
    cleanup();
  });
});
