import React from 'react';
import PropTypes from 'prop-types';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

const CourseUnitAnalyticsSlot = ({ unitTitle, isUnitVerticalType, courseVerticalChildren }) => (
  <PluginSlot id="course_unit_analytics_slot" pluginProps={{ unitTitle, isUnitVerticalType, courseVerticalChildren }} />
);

CourseUnitAnalyticsSlot.propTypes = {
  unitTitle: PropTypes.string,
  isUnitVerticalType: PropTypes.bool.isRequired,
  courseVerticalChildren: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      blockId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      blockType: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default CourseUnitAnalyticsSlot;
