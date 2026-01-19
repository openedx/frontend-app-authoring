import { SchoolOutline } from '@openedx/paragon/icons';
import { ContentTagsDrawer } from '@src/content-tags-drawer';
import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseDetails } from '@src/data/apiHooks';
import { SidebarTitle } from '@src/generic/sidebar';
import { useOutlineSidebarContext } from './OutlineSidebarContext';

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
    <div>
      <SidebarTitle
        title={
          contentData && 'displayName' in contentData
            ? contentData.displayName
            : courseData?.name || ''
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
