import React from 'react';
import { useSelector } from 'react-redux';
import { Stack } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getStudioHomeData } from '../data/selectors';
import CourseItem from './course-item';
import messages from './messages';

const ProcessingCourses = () => {
  const intl = useIntl();
  const { inProcessCourseActions } = useSelector(getStudioHomeData);

  return (
    <>
      <p className="text-gray-500">
        {intl.formatMessage(messages.processingTitle)}
      </p>
      <hr />
      <Stack gap={3}>
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
