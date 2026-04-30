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
  const { setCurrentSelection, sections } = useCourseOutlineContext();
  const { selectedContainerState, clearSelection, openContainerSidebar } = useOutlineSidebarContext();

  const sidebarContentId = selectedContainerState?.currentId || courseId;

  const { data: contentData } = useContentData(sidebarContentId);

  const handleBack = () => {
    const { currentId, subsectionId, sectionId } = selectedContainerState || {};
    const sectionIndex = sections.findIndex((section) => section.id === sectionId);
    const subsectionIndex = sections
      .find((section) => section.id === sectionId)
      ?.childInfo.children.findIndex((subsection) => subsection.id === subsectionId) ?? -1;

    if (!currentId) {
      clearSelection();
      setCurrentSelection(undefined);
      return;
    }

    if (currentId === subsectionId && sectionId) {
      openContainerSidebar(sectionId, undefined, sectionId, sectionIndex >= 0 ? sectionIndex : undefined);
      setCurrentSelection({
        currentId: sectionId,
        sectionId,
        index: sectionIndex >= 0 ? sectionIndex : undefined,
      });
      return;
    }

    if (currentId === sectionId) {
      clearSelection();
      setCurrentSelection(undefined);
      return;
    }

    if (subsectionId) {
      openContainerSidebar(
        subsectionId,
        subsectionId,
        sectionId,
        subsectionIndex >= 0 ? subsectionIndex : undefined,
      );
      setCurrentSelection({
        currentId: subsectionId,
        subsectionId,
        sectionId,
        index: subsectionIndex >= 0 ? subsectionIndex : undefined,
      });
      return;
    }

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
