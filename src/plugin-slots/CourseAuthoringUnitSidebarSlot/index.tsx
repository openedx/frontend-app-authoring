import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import { Stack } from '@openedx/paragon';
import TagsSidebarControls from '../../content-tags-drawer/tags-sidebar-controls';
import Sidebar from '../../course-unit/sidebar';
import LocationInfo from '../../course-unit/sidebar/LocationInfo';
import PublishControls from '../../course-unit/sidebar/PublishControls';
import SplitTestSidebarInfo from '../../course-unit/sidebar/SplitTestSidebarInfo';

export const CourseAuthoringUnitSidebarSlot = (
  {
    blockId,
    courseId,
    unitTitle,
    xBlocks,
    readOnly,
    isUnitVerticalType,
    isSplitTestType,
  }: CourseAuthoringUnitSidebarSlotProps,
) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.course_unit_sidebar.v2"
    pluginProps={{
      blockId, courseId, unitTitle, xBlocks, readOnly, isUnitVerticalType, isSplitTestType,
    }}
  >
    <Stack gap={3}>
      {isUnitVerticalType && (
        <PluginSlot
          id="org.openedx.frontend.authoring.course_unit_sidebar.v1"
          idAliases={['course_authoring_unit_sidebar_slot']}
          pluginProps={{
            blockId, courseId, unitTitle, xBlocks, readOnly,
          }}
        >
          <Sidebar data-testid="course-unit-sidebar">
            <PublishControls blockId={blockId} />
          </Sidebar>
          {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
            <Sidebar className="tags-sidebar">
              <TagsSidebarControls readOnly={readOnly} />
            </Sidebar>
          )}
          <Sidebar data-testid="course-unit-location-sidebar">
            <LocationInfo />
          </Sidebar>
        </PluginSlot>
      )}
      {isSplitTestType && (
        <Sidebar data-testid="course-split-test-sidebar">
          <SplitTestSidebarInfo />
        </Sidebar>
      )}
    </Stack>
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
  readOnly: boolean;
  isUnitVerticalType: boolean;
  isSplitTestType: boolean;
}
