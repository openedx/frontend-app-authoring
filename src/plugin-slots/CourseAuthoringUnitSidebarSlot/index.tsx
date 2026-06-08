import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import classNames from 'classnames';

import { UnitSidebar } from '@src/course-unit/unit-sidebar/UnitSidebar';
import { isUnitPageNewDesignEnabled } from '@src/course-unit/utils';

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
  <div
    className={classNames({ 'sidebar': isUnitPageNewDesignEnabled() })}
  >
    <PluginSlot
      id="org.openedx.frontend.authoring.course_unit_sidebar.v2"
      pluginProps={{
        blockId,
        courseId,
        unitTitle,
        xBlocks,
        readOnly,
        isUnitVerticalType,
        isSplitTestType,
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
  </div>
);

type XBlock = {
  id: string;
  name: string;
  blockType: string;
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
