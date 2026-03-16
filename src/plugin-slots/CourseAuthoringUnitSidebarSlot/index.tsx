import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import { UnitSidebar } from '@src/course-unit/unit-sidebar/UnitSidebar';

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
    <UnitSidebar
      legacySidebarProps={{
        unitTitle,
        xBlocks,
        readOnly,
        isUnitVerticalType,
        isSplitTestType,
      }}
    />
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
