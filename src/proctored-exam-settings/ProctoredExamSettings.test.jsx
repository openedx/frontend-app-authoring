import React from 'react';
import { mount } from 'enzyme';

import ProctoredExamSettings from './ProctoredExamSettings';

const defaultProps = {
  courseId: 'course-v1%3AedX%2BDemoX%2BDemo_Course',
};

describe('ProctoredExamSettings', () => {
  it('updates settings based on proctoring provider', () => {
    const component = mount(<ProctoredExamSettings {...defaultProps} />);

    // confirm that changing proctoring provider to proctortrack changes zendesk ticket field
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'proctortrack' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(false);

    // confirm that changing proctoring provider to software_secure changes zendesk ticket field
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'software_secure' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(true);

    // confirm that changing proctoring provider to any other provider does not change zendesk ticket field
    component.find('select#proctoringProvider').simulate('change', { target: { value: 'mockprock' } });
    expect(component.find('input#createZendeskTickets').prop('checked')).toEqual(true);
  });
});
