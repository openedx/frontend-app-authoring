import React from 'react';
import PropTypes from 'prop-types';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

const CourseOutlineUnitCardExtraActionsSlot = ({ unit, subsection, section }) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.course_outline_unit_card_extra_actions.v1"
    idAliases={['course_outline_unit_card_extra_actions_slot']}
    pluginProps={{ unit, subsection, section }}
  />
);

CourseOutlineUnitCardExtraActionsSlot.propTypes = {
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
    actions: PropTypes.shape({
      deletable: PropTypes.bool.isRequired,
      draggable: PropTypes.bool.isRequired,
      childAddable: PropTypes.bool.isRequired,
      duplicable: PropTypes.bool.isRequired,
    }).isRequired,
    isHeaderVisible: PropTypes.bool,
    enableCopyPasteUnits: PropTypes.bool,
    discussionEnabled: PropTypes.bool,
  }).isRequired,
  subsection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
    isTimeLimited: PropTypes.bool,
    graded: PropTypes.bool,
  }).isRequired,
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
  }).isRequired,
};

export default CourseOutlineUnitCardExtraActionsSlot;
