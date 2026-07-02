import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { AlignSidebar } from '@src/generic/sidebar/AlignSidebar';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { useBackNavigation } from './back-navigation';
import { useOutlineSidebarContext } from './OutlineSidebarContext';

/**
 * Align sidebar for course or selected containers.
 */
export const OutlineAlignSidebar = () => {
  const { courseId } = useCourseAuthoringContext();
  const { selectContainer } = useCourseOutlineContext();
  const { selectedContainerState, openContainerSidebar } = useOutlineSidebarContext();

  const sidebarContentId = selectedContainerState?.currentId || courseId;

  const { data: contentData } = useContentData(sidebarContentId);

  const handleBack = useBackNavigation({
    openContainer: openContainerSidebar,
    onSelectionChange: selectContainer,
  });

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
