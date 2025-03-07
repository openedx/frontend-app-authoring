import React from 'react';
import PropTypes from 'prop-types';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CourseOutlineAnalyticsSlot = ({ hasSections, sections }) => (
  <PluginSlot id="course_outline_analytics_slot" pluginProps={{ hasSections, sections }} />
);

CourseOutlineAnalyticsSlot.propTypes = {
  hasSections: PropTypes.bool.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default CourseOutlineAnalyticsSlot;
