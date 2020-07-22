import React from 'react';
import { mount } from 'enzyme';
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
          proctoring_provider: 'proctortrack',
          proctoring_escalation_email: 'test@example.com',
          create_zendesk_tickets: false,
        },
        available_proctoring_providers: ['software_secure', 'proctortrack', 'mockproc'],
      },
      catch: () => {},
    }),
  }));

  auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3 }));
  const component = mount(<ProctoredExamSettings {...defaultProps} />);

  beforeEach(() => {
    component.update();
  });

  it('updates zendesk ticket field if proctortrack is provider', () => {
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'proctortrack' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(false);
  });

  it('updates zendesk ticket field if software_secure is provider', () => {
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'software_secure' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(true);
  });

  it('does not update zendesk ticket field for any other provider', () => {
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'mockproc' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(true);
  });
});
