import React from 'react';
import {
  render, screen, cleanup, waitFor, waitForElementToBeRemoved, fireEvent, act,
} from '@testing-library/react';
import * as auth from '@edx/frontend-platform/auth';
import ProctoredExamSettings from './ProctoredExamSettings';
import StudioApiService from '../data/services/StudioApiService';

const defaultProps = {
  courseId: 'course-v1%3AedX%2BDemoX%2BDemo_Course',
};

describe('ProctoredExamSettings check default on create zendesk ticket field tests', () => {
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
      },
      catch: () => {},
    }),
  }));

  auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3 }));

  beforeEach(async () => {
    await act(async () => render(<ProctoredExamSettings {...defaultProps} />));
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
});

describe('ProctoredExamSettings connection states tests', () => {
  it('shows the spinner before the connection is complete', async () => {
    render(<ProctoredExamSettings {...defaultProps} />);
    const spinner = screen.getByTestId('spinnerContainer');
    expect(spinner.textContent).toEqual('Loading...');
    await waitForElementToBeRemoved(spinner);
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

    await act(async () => render(<ProctoredExamSettings {...defaultProps} />));
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

    await act(async () => render(<ProctoredExamSettings {...defaultProps} />));
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
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3 }));
    return { mockClientGet, mockClientPost };
  }

  it('Makes API call successfully', async () => {
    const mockedFunctions = mockAPI(mockGetData, { data: 'success' });
    await act(async () => render(<ProctoredExamSettings {...defaultProps} />));
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
  });

  it('Makes API call generated error', async () => {
    const mockedFunctions = mockAPI(mockGetData, false);
    await act(async () => render(<ProctoredExamSettings {...defaultProps} />));
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
    const errorAlert = screen.getByTestId('saveError');
    expect(errorAlert.textContent).toEqual(
      expect.stringContaining('We encountered a technical error while trying to save proctored exam settings'),
    );
  });

  afterEach(() => {
    cleanup();
  });
});
