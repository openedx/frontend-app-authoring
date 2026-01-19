import { useParams } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import { Stack } from '@openedx/paragon';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import TagsSidebarControls from '@src/content-tags-drawer/tags-sidebar-controls';
import SidebarSection from './SidebarSection';
import LocationInfo from './LocationInfo';
import SplitTestSidebarInfo from './SplitTestSidebarInfo';
import PublishControls from '../unit-sidebar/unit-info/PublishControls';

export type XBlock = {
  id: string,
  name: string,
  blockType: string,
};

export interface LegacySidebarProps {
  unitTitle: string;
  xBlocks: XBlock[];
  readOnly: boolean;
  isUnitVerticalType: boolean;
  isSplitTestType: boolean;
}

const LegacySidebar = ({
  unitTitle,
  isUnitVerticalType,
  xBlocks,
  readOnly,
  isSplitTestType,
}: LegacySidebarProps) => {
  const { blockId } = useParams();
  const { courseId } = useCourseAuthoringContext();

  return (
    <Stack gap={3} className="px-4">
      {isUnitVerticalType && (
        <PluginSlot
          id="org.openedx.frontend.authoring.course_unit_sidebar.v1"
          idAliases={['course_authoring_unit_sidebar_slot']}
          pluginProps={{
            blockId,
            courseId,
            unitTitle,
            xBlocks,
            readOnly,
          }}
        >
          <SidebarSection data-testid="course-unit-sidebar">
            <PublishControls blockId={blockId} />
          </SidebarSection>
          {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
            <SidebarSection className="tags-sidebar">
              <TagsSidebarControls readOnly={readOnly} />
            </SidebarSection>
          )}
          <SidebarSection data-testid="course-unit-location-sidebar">
            <LocationInfo />
          </SidebarSection>
        </PluginSlot>
      )}
      {isSplitTestType && (
        <SidebarSection data-testid="course-split-test-sidebar">
          <SplitTestSidebarInfo />
        </SidebarSection>
      )}
    </Stack>
  );
};

export default LegacySidebar;
