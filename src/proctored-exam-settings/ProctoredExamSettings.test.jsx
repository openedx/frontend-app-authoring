import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import * as auth from '@edx/frontend-platform/auth';
import ProctoredExamSettings from './ProctoredExamSettings';

const defaultProps = {
  courseId: 'course-v1%3AedX%2BDemoX%2BDemo_Course',
};

const waitForComponentToPaint = async (wrapper, callback) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();
    callback(wrapper);
  });
};

describe('ProctoredExamSettings', () => {
  beforeEach(() => {
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
  });

  it('updates zendesk ticket field if proctortrack is provider', () => {
    const component = mount(<ProctoredExamSettings {...defaultProps} />);
    waitForComponentToPaint(component, (comp) => {
      comp.find('select#proctoringProvider').simulate('change', { target: { value: 'proctortrack' } });
      expect(comp.find('input#createZendeskTickets').prop('checked')).toEqual(false);
    });
  });

  it('updates zendesk ticket field if software_secure is provider', () => {
    const component = mount(<ProctoredExamSettings {...defaultProps} />);
    waitForComponentToPaint(component, (comp) => {
      comp.find('select#proctoringProvider').simulate('change', { target: { value: 'software_secure' } });
      expect(comp.find('input#createZendeskTickets').prop('checked')).toEqual(true);
    });
  });

  it('does not update zendesk ticket field for any other provider', () => {
    const component = mount(<ProctoredExamSettings {...defaultProps} />);
    waitForComponentToPaint(component, (comp) => {
      comp.find('select#proctoringProvider').simulate('change', { target: { value: 'mockproc' } });
      expect(comp.find('input#createZendeskTickets').prop('checked')).toEqual(true);
    });
  });
});
