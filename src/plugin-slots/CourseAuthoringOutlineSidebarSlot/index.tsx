import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import React from 'react';
import OutlineSideBar from '../../course-outline/outline-sidebar/OutlineSidebar';

export const CourseAuthoringOutlineSidebarSlot = ({
  courseId,
  courseName,
  sections,
}: CourseAuthoringOutlineSidebarSlotProps) => (
  <PluginSlot
    id="course_authoring_outline_sidebar_slot"
    pluginProps={{
      courseId,
      courseName,
      sections,
    }}
  >
    <OutlineSideBar courseId={courseId} />
  </PluginSlot>
);

type Section = {
  id: string,
  displayName: string,
};

interface CourseAuthoringOutlineSidebarSlotProps {
  courseId: string;
  courseName: string;
  sections: Section[];
}
