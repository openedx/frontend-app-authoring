import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import React from 'react';
import OutlineSideBar from '../../course-outline/outline-sidebar/OutlineSidebar';

export const CourseAuthoringOutlineSidebarSlot = ({
  courseId,
  courseName,
  sections,
}: CourseAuthoringOutlineSidebarSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.course_outline_sidebar.v1"
    idAliases={['course_authoring_outline_sidebar_slot']}
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
  graded: boolean,
  category: string,
};

interface CourseAuthoringOutlineSidebarSlotProps {
  courseId: string;
  courseName: string;
  sections: Section[];
}
