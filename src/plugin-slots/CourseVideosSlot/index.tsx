import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CourseVideosTable } from '@src/files-and-videos/videos-page/CourseVideosTable';
import React from 'react';

const CourseVideosSlot = () => (
  <PluginSlot id="org.openedx.frontend.authoring.videos_upload_page_table.v1">
    <CourseVideosTable />
  </PluginSlot>
);

export default CourseVideosSlot;
