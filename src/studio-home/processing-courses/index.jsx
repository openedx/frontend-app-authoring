import React from 'react';
import { useSelector } from 'react-redux';
import { Stack } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getStudioHomeData } from '../data/selectors';
import CourseItem from './course-item';
import messages from './messages';

const ProcessingCourses = () => {
  const intl = useIntl();
  const { inProcessCourseActions } = useSelector(getStudioHomeData);

  return (
    <>
      <div className="text-gray-500 small" data-testid="processing-courses-title">
        {intl.formatMessage(messages.processingTitle)}
      </div>
      <hr />
      <Stack gap={3} className="border-bottom border-light-400 mb-4 px-4 pt-3">
        {inProcessCourseActions.map((course) => (
          <CourseItem
            course={course}
            key={course.courseKey}
          />
        ))}
      </Stack>
    </>
  );
};

export default ProcessingCourses;
