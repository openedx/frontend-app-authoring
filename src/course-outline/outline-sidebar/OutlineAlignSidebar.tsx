import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { AlignSidebar } from '@src/generic/sidebar/AlignSidebar';
import { useOutlineSidebarContext } from './OutlineSidebarContext';

/**
 * Align sidebar for course or selected containers.
 */
export const OutlineAlignSidebar = () => {
  const {
    courseId,
    currentSelection,
    setCurrentSelection,
  } = useCourseAuthoringContext();
  const { selectedContainerState, clearSelection } = useOutlineSidebarContext();

  const sidebarContentId = currentSelection?.currentId || selectedContainerState?.currentId || courseId;

  const { data: contentData } = useContentData(sidebarContentId);

  // istanbul ignore next
  const handleBack = () => {
    clearSelection();
    setCurrentSelection(undefined);
  };

  return (
    <AlignSidebar
      title={
        contentData && 'displayName' in contentData
          ? contentData.displayName
          : contentData?.courseDisplayNameWithDefault || ''
      }
      contentId={sidebarContentId}
      onBackBtnClick={(sidebarContentId !== courseId) ? handleBack : undefined}
    />
  );
};
