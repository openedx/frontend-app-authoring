import { SchoolOutline } from '@openedx/paragon/icons';
import { ContentTagsDrawer } from '@src/content-tags-drawer';
import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { SidebarTitle } from '@src/generic/sidebar';
import { useOutlineSidebarContext } from './OutlineSidebarContext';

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
    <div>
      <SidebarTitle
        title={
          contentData && 'displayName' in contentData
            ? contentData.displayName
            : contentData?.courseDisplayNameWithDefault || ''
        }
        icon={SchoolOutline}
        onBackBtnClick={(sidebarContentId !== courseId) ? handleBack : undefined}
      />
      <ContentTagsDrawer
        id={sidebarContentId}
        variant="component"
      />
    </div>
  );
};
