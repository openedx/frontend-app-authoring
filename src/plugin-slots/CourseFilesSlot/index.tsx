import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CourseFilesTable } from '@src/files-and-videos/files-page/CourseFilesTable';
import React from 'react';

const CourseFilesSlot = () => (
  <PluginSlot id="org.openedx.frontend.authoring.files_upload_page_table.v1">
    <CourseFilesTable />
  </PluginSlot>
);

export default CourseFilesSlot;
