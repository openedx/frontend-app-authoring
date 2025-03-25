import React from 'react';
import PropTypes from 'prop-types';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HeaderNavigations from 'CourseAuthoring/course-unit/header-navigations/HeaderNavigations';
import { COURSE_BLOCK_NAMES } from 'CourseAuthoring/constants';

const CourseUnitHeaderActionsSlot = ({
  headerNavigationsActions, unitCategory, unitTitle, verticalBlocks,
}) => {
  const isUnitVerticalType = unitCategory === COURSE_BLOCK_NAMES.vertical.id;
  return (
    <PluginSlot
      id="course_unit_header_actions_slot"
      pluginProps={{
        headerNavigationsActions, unitCategory, unitTitle, isUnitVerticalType, verticalBlocks,
      }}
    >
      <HeaderNavigations headerNavigationsActions={headerNavigationsActions} unitCategory={unitCategory} />
    </PluginSlot>
  );
};

CourseUnitHeaderActionsSlot.propTypes = {
  headerNavigationsActions: PropTypes.shape({
    handleViewLive: PropTypes.func.isRequired,
    handlePreview: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
  }).isRequired,
  unitCategory: PropTypes.string.isRequired,
  unitTitle: PropTypes.string.isRequired,
  verticalBlocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      blockId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      blockType: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default CourseUnitHeaderActionsSlot;
