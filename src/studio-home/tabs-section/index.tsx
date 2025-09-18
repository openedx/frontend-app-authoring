import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { getLoadingStatuses, getStudioHomeData } from '../data/selectors';
import CoursesTab from './courses-tab';
import { RequestStatus } from '../../data/constants';

const TabsSection = ({
  showNewCourseContainer,
  onClickNewCourse,
  isShowProcessing,
  isPaginationCoursesEnabled,
}) => {
  const {
    courses,
    numPages,
  } = useSelector(getStudioHomeData);
  const {
    courseLoadingStatus,
  } = useSelector(getLoadingStatuses);
  const isLoadingCourses = courseLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailedCoursesPage = courseLoadingStatus === RequestStatus.FAILED;

  return (
    <CoursesTab
      coursesDataItems={courses}
      showNewCourseContainer={showNewCourseContainer}
      onClickNewCourse={onClickNewCourse}
      isShowProcessing={isShowProcessing}
      isLoading={isLoadingCourses}
      isFailed={isFailedCoursesPage}
      numPages={numPages}
      isEnabledPagination={isPaginationCoursesEnabled}
    />
  );
};

TabsSection.defaultProps = {
  isPaginationCoursesEnabled: false,
};

TabsSection.propTypes = {
  showNewCourseContainer: PropTypes.bool.isRequired,
  onClickNewCourse: PropTypes.func.isRequired,
  isShowProcessing: PropTypes.bool.isRequired,
  isPaginationCoursesEnabled: PropTypes.bool,
};

export default TabsSection;
