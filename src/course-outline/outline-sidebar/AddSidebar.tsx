import { useIntl } from '@edx/frontend-platform/i18n';
import { SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import messages from './messages';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ComponentPicker } from '../../library-authoring';
import { ContentType } from '../../library-authoring/routes';
import { SidebarFilters } from '@src/library-authoring/library-filters/SidebarFilters';

export const AddSidebar = ({}: { courseId: string }) => {
  const intl = useIntl();
  const { courseDetails } = useCourseAuthoringContext();

  return (
    <div>
      <SidebarTitle
        title={courseDetails?.name || ''}
        icon={SchoolOutline}
      />
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionSummary)}
          icon={SchoolOutline}
        >
          <ShowLibraryContent />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};

const ShowLibraryContent = () => {
  return (
    <ComponentPicker
      showOnlyPublished
      extraFilter={['block_type IN ["unit", "section", "subsection"]']}
      libraryIds={[]}
      selectLibrary={false}
      visibleTabs={[ContentType.home]}
      FiltersComponent={SidebarFilters}
    />
  );
}
