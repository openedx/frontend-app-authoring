import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HeaderNavigations, { HeaderNavigationsProps } from 'CourseAuthoring/course-outline/header-navigations/HeaderNavigations';

interface CourseOutlineHeaderActionsSlotProps extends HeaderNavigationsProps {
  sections: Array<({
    id: string,
    displayName: string,
  })>,
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

export default CourseOutlineHeaderActionsSlot;
