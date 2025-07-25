import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseItemData } from '../course-outline/data/apiHooks';

const SubsectionUnitRedirect = ({ courseId }: { courseId: string }) => {
  const { subsectionId } = useParams();
  // if the call is made via the click on breadcrumbs the re won't be courseId available
  // in such cases the page should redirect to the 1st unit of he subsection
  const navigate = useNavigate();
  const { data: courseItemData } = useCourseItemData(subsectionId);
  const firstUnitId = courseItemData?.childInfo?.children?.[0]?.id;
  let url: string;

  useEffect(() => {
    if (firstUnitId) {
      url = `/course/${courseId}/container/${firstUnitId}`;
      navigate(url, { replace: true });
    }
  }, [courseItemData]);
  // if no unit then navigate to the subsection outline
  url = `/course/${courseId}?show=${subsectionId}`;
  navigate(url, { replace: true });
};
export default SubsectionUnitRedirect;
