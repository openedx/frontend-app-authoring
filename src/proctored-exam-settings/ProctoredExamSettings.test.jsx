import React from 'react';
import {
  render, screen, cleanup, waitFor, fireEvent, act,
} from '@testing-library/react';
import * as auth from '@edx/frontend-platform/auth';
import ProctoredExamSettings from './ProctoredExamSettings';

const defaultProps = {
  courseId: 'course-v1%3AedX%2BDemoX%2BDemo_Course',
};

describe('ProctoredExamSettings', () => {
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
