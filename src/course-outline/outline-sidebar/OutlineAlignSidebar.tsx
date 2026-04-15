import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { AlignSidebar } from '@src/generic/sidebar/AlignSidebar';
import { useOutlineSidebarContext } from './OutlineSidebarContext';

/**
 * Align sidebar for course or selected containers.
 */
export const OutlineAlignSidebar = () => {
  const { courseId } = useCourseAuthoringContext();
  const { setCurrentSelection } = useCourseOutlineContext();
  const { selectedContainerState, clearSelection } = useOutlineSidebarContext();

  const sidebarContentId = selectedContainerState?.currentId || courseId;

  const { data: contentData } = useContentData(sidebarContentId);

  // istanbul ignore next
  const handleBack = () => {
    clearSelection();
    setCurrentSelection(undefined);
  };

  return (
    <AlignSidebar
      title={contentData && 'displayName' in contentData
        ? contentData.displayName
        : contentData?.courseDisplayNameWithDefault || ''}
      contentId={sidebarContentId}
      onBackBtnClick={(sidebarContentId !== courseId) ? handleBack : undefined}
    />
  );
};
