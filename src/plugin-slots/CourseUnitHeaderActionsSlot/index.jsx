import React from 'react';
import PropTypes from 'prop-types';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HeaderNavigations from 'CourseAuthoring/course-unit/header-navigations/HeaderNavigations';
import { COURSE_BLOCK_NAMES } from 'CourseAuthoring/constants';

const CourseUnitHeaderActionsSlot = ({
  headerNavigationsActions, category, unitTitle, verticalBlocks,
}) => {
  const isUnitVerticalType = category === COURSE_BLOCK_NAMES.vertical.id;
  return (
    <PluginSlot
      id="org.openedx.frontend.authoring.course_unit_header_actions.v1"
      idAliases={['course_unit_header_actions_slot']}
      pluginProps={{
        headerNavigationsActions, category, unitTitle, isUnitVerticalType, verticalBlocks,
      }}
    >
      <HeaderNavigations headerNavigationsActions={headerNavigationsActions} category={category} />
    </PluginSlot>
  );
};

CourseUnitHeaderActionsSlot.propTypes = {
  headerNavigationsActions: PropTypes.shape({
    handleViewLive: PropTypes.func.isRequired,
    handlePreview: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
  }).isRequired,
  category: PropTypes.string.isRequired,
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
