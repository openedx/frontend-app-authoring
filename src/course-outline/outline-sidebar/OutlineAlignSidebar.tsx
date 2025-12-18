import { SchoolOutline } from "@openedx/paragon/icons";
import { ContentTagsDrawer } from "@src/content-tags-drawer";
import { useCourseDetails } from "@src/data/apiHooks";
import { SidebarTitle } from "@src/generic/sidebar";

export const OutlineAlignSidebar = ({ courseId }: { courseId: string }) => {
  const {
    data: courseData,
  } = useCourseDetails(courseId);
  
  return (
    <div>
      <SidebarTitle
        title={courseData?.name || ''}
        icon={SchoolOutline}
      />
      <ContentTagsDrawer
        id={courseId}
        variant='component'
      />
    </div>
  );
};
