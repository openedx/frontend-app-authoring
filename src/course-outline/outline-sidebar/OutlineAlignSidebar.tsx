import { SchoolOutline } from '@openedx/paragon/icons';
import { ContentTagsDrawer } from '@src/content-tags-drawer';
import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { SidebarTitle } from '@src/generic/sidebar';
import { useMemo } from 'react';
import { useOutlineSidebarContext } from './OutlineSidebarContext';

export const OutlineAlignSidebar = () => {
  const { courseId, currentSelection } = useCourseAuthoringContext();
  const { selectedContainerState } = useOutlineSidebarContext();

  const sidebarContentId = useMemo(() => {
    return currentSelection?.currentId || selectedContainerState?.currentId || courseId
  }, [currentSelection, selectedContainerState, courseId]);

  const { data: contentData } = useContentData(sidebarContentId);

  return (
    <div>
      <SidebarTitle
        title={
          contentData && 'displayName' in contentData
            ? contentData.displayName
            : contentData?.courseDisplayNameWithDefault || ''
        }
        icon={SchoolOutline}
      />
      <ContentTagsDrawer
        id={sidebarContentId}
        variant="component"
      />
    </div>
  );
};
