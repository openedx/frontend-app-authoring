import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HeaderActions from '@src/course-outline/header-navigations/HeaderActions';
import type { OutlinePageErrors, XBlockActions } from '@src/data/types';

interface CourseOutlineHeaderActionsSlotProps {
  isReIndexShow: boolean;
  isSectionsExpanded: boolean;
  isDisabledReindexButton: boolean;
  headerNavigationsActions: {
    handleNewSection: () => void;
    handleReIndex: () => void;
    handleExpandAll: () => void;
    lmsLink: string;
  };
  hasSections: boolean;
  courseActions: XBlockActions;
  errors?: OutlinePageErrors;
  sections: Array<
    ({
      id: string;
      displayName: string;
    })
  >;
}

const CourseOutlineHeaderActionsSlot = ({
  headerNavigationsActions,
  isReIndexShow,
  isSectionsExpanded,
  isDisabledReindexButton,
  hasSections,
  courseActions,
  errors,
  sections,
}: CourseOutlineHeaderActionsSlotProps) => (
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
    <HeaderActions
      courseActions={courseActions}
      headerNavigationsActions={headerNavigationsActions}
      isReIndexShow={isReIndexShow}
      isDisabledReindexButton={isDisabledReindexButton}
      errors={errors}
    />
  </PluginSlot>
);

export default CourseOutlineHeaderActionsSlot;
