import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseDetails } from '@src/data/apiHooks';
import { useOutlineSidebarContext } from './OutlineSidebarContext';
import { AlignSidebar } from '@src/generic/sidebar/AlignSidebar';

/**
 * Align sidebar for course or selected containers.
 */
export const OutlineAlignSidebar = () => {
  const { courseId } = useCourseAuthoringContext();
  const { currentContainerId } = useOutlineSidebarContext();

  const sidebarContentId = currentContainerId || courseId;

  const {
    data: courseData,
  } = useCourseDetails(courseId);

  const {
    data: contentData,
  } = useContentData(currentContainerId);

  return (
    <AlignSidebar
      title={
        contentData && 'displayName' in contentData
          ? contentData.displayName
          : courseData?.name || ''
      }
      contentId={sidebarContentId}
    />
  );
};
