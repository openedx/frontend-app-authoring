import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import React from 'react';
import OutlineSideBar from '../../course-outline/outline-sidebar/OutlineSidebar';

export const CourseAuthoringOutlineSidebarSlot = ({ courseId }: CourseAuthoringOutlineSidebarSlotProps) => (
  <PluginSlot
    id="course_authoring_outline_sidebar_slot"
    pluginProps={{
      courseId,
    }}
  >
    <OutlineSideBar courseId={courseId} />
  </PluginSlot>
);

interface CourseAuthoringOutlineSidebarSlotProps {
  courseId: string;
}
