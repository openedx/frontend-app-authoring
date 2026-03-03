import { LoadingSpinner } from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { useParams, Navigate } from 'react-router-dom';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { XBlock } from '@src/data/types';

const SubsectionUnitRedirect = () => {
  const { courseId } = useCourseAuthoringContext();
  let { subsectionId } = useParams();
  // if the call is made via the click on breadcrumbs the re won't be courseId available
  // in such cases the page should redirect to the 1st unit of he subsection
  const { data: courseItemData, isLoading } = useCourseItemData<XBlock>(subsectionId);
  let firstUnitId = courseItemData?.childInfo?.children?.[0]?.id;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (firstUnitId) {
    firstUnitId = encodeURIComponent(firstUnitId);
    return <Navigate replace to={`/course/${courseId}/container/${firstUnitId}`} />;
  }
  if (subsectionId) {
    // if no unit then navigate to the subsection outline
    subsectionId = encodeURIComponent(subsectionId);
    return <Navigate replace to={`/course/${courseId}?show=${subsectionId}`} />;
  }

  // navigate to the course page if no subsectionId and no unitId
  return <Navigate replace to={`/course/${courseId}`} />;
};
export default SubsectionUnitRedirect;
