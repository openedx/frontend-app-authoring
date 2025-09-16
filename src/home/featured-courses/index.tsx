import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router';
import { Plus } from '@untitledui/icons';
import FeaturedLayout from 'home/layout/featured';
import Button from 'shared/Components/Common/Button';
import { RequestStatus } from '../../data/constants';
import { getLoadingStatuses, getStudioHomeData } from '../data/selectors';
import Courses from './courses';
import messages from './messages';

const MAX_ITEMS = 3;

const FeaturedCourses = ({
  hasAbilityToCreateNewCourse,
  onClickNewCourse,
  isPaginationCoursesEnabled,
}: {
  hasAbilityToCreateNewCourse: boolean;
  onClickNewCourse: () => void;
  isPaginationCoursesEnabled: boolean;
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { courses } = useSelector(getStudioHomeData);

  // Make sure it only shows the first 3 items
  const filteredCourses = useMemo(
    () => courses.slice(0, MAX_ITEMS),
    [courses],
  );

  const { courseLoadingStatus } = useSelector(getLoadingStatuses);

  const isLoadingCourses = courseLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailedCoursesPage = courseLoadingStatus === RequestStatus.FAILED;

  const actions = (
    <>
      {hasAbilityToCreateNewCourse && (
      <Button
        className="!tw-w-auto"
        variant="link"
        size="sm"
        disabled={false}
        onClick={() => navigate('/courses')}
        labels={{ default: intl.formatMessage(messages.allCoursesBtnText) }}
      />
      )}
      <Button
        className="!tw-w-auto tw-border-gray-300 tw-text-gray-700"
        variant="secondary"
        iconBefore={Plus}
        size="sm"
        disabled={false}
        onClick={onClickNewCourse}
        labels={{ default: intl.formatMessage(messages.addNewCourseBtnText) }}
      />
    </>
  );

  return (
    <FeaturedLayout title={intl.formatMessage(messages.coursesTabTitle)} actions={actions}>
      <Courses
        coursesDataItems={filteredCourses}
        showNewCourseContainer={false}
        onClickNewCourse={onClickNewCourse}
        isLoading={isLoadingCourses}
        isFailed={isFailedCoursesPage}
        isEnabledPagination={isPaginationCoursesEnabled}
      />
    </FeaturedLayout>

  );
};

export default FeaturedCourses;
