import React from 'react';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HeaderNavigations from 'CourseAuthoring/course-outline/header-navigations/HeaderNavigations';

const CourseOutlineHeaderActionsSlot = ({
  headerNavigationsActions,
  isReIndexShow,
  isSectionsExpanded,
  isDisabledReindexButton,
  hasSections,
  courseActions,
  errors,
  sections,
}) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.course_outline_header_actions.v1"
    idAliases={['course_outline_header_actions_slot']}
    pluginProps={{
      isReIndexShow,
      isSectionsExpanded,
      isDisabledReindexButton,
      headerNavigationsActions,
      hasSections,
      courseActions,
      errors,
      sections,
    }}
  >
    <HeaderNavigations
      headerNavigationsActions={headerNavigationsActions}
      isReIndexShow={isReIndexShow}
      isSectionsExpanded={isSectionsExpanded}
      isDisabledReindexButton={isDisabledReindexButton}
      hasSections={hasSections}
      courseActions={courseActions}
      errors={errors}
    />
  </PluginSlot>
);

CourseOutlineHeaderActionsSlot.propTypes = {
  isReIndexShow: PropTypes.bool.isRequired,
  isSectionsExpanded: PropTypes.bool.isRequired,
  isDisabledReindexButton: PropTypes.bool.isRequired,
  headerNavigationsActions: PropTypes.shape({
    handleNewSection: PropTypes.func.isRequired,
    handleReIndex: PropTypes.func.isRequired,
    handleExpandAll: PropTypes.func.isRequired,
    lmsLink: PropTypes.string.isRequired,
  }).isRequired,
  hasSections: PropTypes.bool.isRequired,
  courseActions: PropTypes.shape({
    deletable: PropTypes.bool.isRequired,
    draggable: PropTypes.bool.isRequired,
    childAddable: PropTypes.bool.isRequired,
    duplicable: PropTypes.bool.isRequired,
  }).isRequired,
  errors: PropTypes.shape({
    outlineIndexApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    reindexApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    sectionLoadingApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
    courseLaunchApi: PropTypes.shape({
      data: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
  }),
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default CourseOutlineHeaderActionsSlot;
