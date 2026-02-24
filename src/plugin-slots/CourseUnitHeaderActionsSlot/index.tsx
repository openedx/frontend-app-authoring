import { PluginSlot } from '@openedx/frontend-plugin-framework';

import HeaderNavigations, { HeaderNavigationActions } from 'CourseAuthoring/course-unit/header-navigations/HeaderNavigations';
import { COURSE_BLOCK_NAMES } from 'CourseAuthoring/constants';

export interface CourseUnitHeaderActionsSlotProps {
  headerNavigationsActions: HeaderNavigationActions;
  category: string;
  unitTitle: string;
  verticalBlocks: {
    id: string;
    blockId: string;
    name: string;
    blockType: string;
  }[];
  isPublished: boolean;
}

const CourseUnitHeaderActionsSlot = ({
  headerNavigationsActions,
  category,
  unitTitle,
  verticalBlocks,
  isPublished,
}: CourseUnitHeaderActionsSlotProps) => {
  const isUnitVerticalType = category === COURSE_BLOCK_NAMES.vertical.id;
  return (
    <PluginSlot
      id="org.openedx.frontend.authoring.course_unit_header_actions.v1"
      idAliases={['course_unit_header_actions_slot']}
      pluginProps={{
        headerNavigationsActions,
        category,
        unitTitle,
        isUnitVerticalType,
        verticalBlocks,
        isPublished,
      }}
    >
      <HeaderNavigations
        headerNavigationsActions={headerNavigationsActions}
        category={category}
        isPublished={isPublished}
      />
    </PluginSlot>
  );
};

export default CourseUnitHeaderActionsSlot;
