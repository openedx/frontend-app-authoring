import { useIntl } from '@edx/frontend-platform/i18n';
import { SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import messages from './messages';
import contentMessages from '@src/library-authoring/add-content/messages';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ComponentPicker } from '../../library-authoring';
import { ContentType } from '../../library-authoring/routes';
import { SidebarFilters } from '@src/library-authoring/library-filters/SidebarFilters';
import { Button, Stack, Tab, Tabs } from '@openedx/paragon';
import { getItemIcon } from '@src/generic/block-type-utils';

type AddContentButtonProps = {
  contentType: {
    name: string,
    blockType: 'unit' | 'subsection' | 'section',
  },
  onCreateContent: (blockType: string) => void,
};

/** Add Content Button */
const AddContentButton = ({ contentType, onCreateContent } : AddContentButtonProps) => {
  const {
    name,
    blockType,
  } = contentType;
  return (
    <Button
      variant="outline-primary"
      className="m-2"
      iconBefore={getItemIcon(blockType)}
      onClick={() => onCreateContent(blockType)}
    >
      {name}
    </Button>
  );
};

/** Add New Content Tab Section */
const AddNewContent = () => {
  const intl = useIntl();
  return (
    <Stack gap={2}>
      <AddContentButton
        key="section"
        contentType={{
          name: intl.formatMessage(contentMessages.sectionButton),
          blockType: 'section',
        }}
        onCreateContent={() => {}}
      />
      <AddContentButton
        key="subsection"
        contentType={{
          name: intl.formatMessage(contentMessages.subsectionButton),
          blockType: 'subsection',
        }}
        onCreateContent={() => {}}
      />
      <AddContentButton
        key="unit"
        contentType={{
          name: intl.formatMessage(contentMessages.unitButton),
          blockType: 'unit',
        }}
        onCreateContent={() => {}}
      />
    </Stack>
  );
}

/** Add Existing Content Tab Section */
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

/** Tabs Component */
const AddTabs = () => {
  const intl = useIntl();

  return (
    <Tabs
      variant="tabs"
      defaultActiveKey="addNew"
      className="my-2 d-flex justify-content-around"
      id="add-content-tabs"
    >
      <Tab eventKey="addNew" title={intl.formatMessage(messages.sidebarTabsAddNew)}>
        <AddNewContent />
      </Tab>
      <Tab eventKey="addExisting" title={intl.formatMessage(messages.sidebarTabsAddExisiting)}>
        <ShowLibraryContent />
      </Tab>
    </Tabs>
  );
}

/** Main Sidebar Component */
export const AddSidebar = () => {
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
          <AddTabs />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
