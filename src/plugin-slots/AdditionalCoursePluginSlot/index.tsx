import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import React from 'react';

export const AdditionalCoursePluginSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.authoring.additional_course_plugin.v1"
    idAliases={['additional_course_plugin']}
  />
);
