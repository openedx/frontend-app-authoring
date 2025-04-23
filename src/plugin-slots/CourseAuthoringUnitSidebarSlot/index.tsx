import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import TagsSidebarControls from '../../content-tags-drawer/tags-sidebar-controls';
import Sidebar from '../../course-unit/sidebar';
import LocationInfo from '../../course-unit/sidebar/LocationInfo';
import PublishControls from '../../course-unit/sidebar/PublishControls';

export const CourseAuthoringUnitSidebarSlot = (
  {
    blockId,
    courseId,
    unitTitle,
    xBlocks,
  }: CourseAuthoringUnitSidebarSlotProps,
) => (
  <PluginSlot
    id="course_authoring_unit_sidebar_slot"
    pluginProps={{
      blockId, courseId, unitTitle, xBlocks,
    }}
  >
    <Sidebar data-testid="course-unit-sidebar">
      <PublishControls blockId={blockId} />
    </Sidebar>
    {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
    <Sidebar className="tags-sidebar">
      <TagsSidebarControls />
    </Sidebar>
    )}
    <Sidebar data-testid="course-unit-location-sidebar">
      <LocationInfo />
    </Sidebar>
  </PluginSlot>
);

type XBlock = {
  id: string,
  name: string,
  blockType: string,
};

interface CourseAuthoringUnitSidebarSlotProps {
  blockId: string;
  courseId: string;
  unitTitle: string;
  xBlocks: XBlock[];
}
