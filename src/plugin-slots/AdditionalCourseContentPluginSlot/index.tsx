import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import React from 'react';

export const AdditionalCourseContentPluginSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.authoring.additional_course_content_plugin.v1"
    idAliases={['additional_course_content_plugin']}
  />
);
