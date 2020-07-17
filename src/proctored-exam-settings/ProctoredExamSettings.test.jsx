import React from 'react';
import { mount } from 'enzyme';

import ProctoredExamSettings from './ProctoredExamSettings';

const defaultProps = {
  courseId: 'course-v1%3AedX%2BDemoX%2BDemo_Course',
};

describe('ProctoredExamSettings', () => {
  const component = mount(<ProctoredExamSettings {...defaultProps} />);

  it('updates zendesk ticket field if proctortrack is provider', () => {
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'proctortrack' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(false);
  });

  it('updates zendesk ticket field if software_secure is provider', () => {
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'software_secure' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(true);
  });

  it('does not update zendesk ticket field for any other provider', () => {
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'mockprock' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(true);
  });
});
