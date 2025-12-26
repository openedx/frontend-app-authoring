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
import { useSelector } from 'react-redux';
import { getSectionsList } from '@src/course-outline/data/selectors';
import { useCallback, useMemo } from 'react';
import { ComponentSelectedEvent } from '@src/library-authoring/common/context/ComponentPickerContext';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { ContainerType } from '@src/generic/key-utils';
import { XBlock } from '@src/data/types';

type ContainerTypes = 'unit' | 'subsection' | 'section';

type AddContentButtonProps = {
  name: string,
  blockType: ContainerTypes,
};

const getLastEditableParent = (blockList: Array<XBlock>) => {
  let index = 1;
  let lastBlock: XBlock;
  while (index < blockList.length) {
    lastBlock = blockList[blockList.length - index];
    if (lastBlock.actions.childAddable) {
      return lastBlock;
    }
    index++;
  }
  return undefined;
}

/** Add Content Button */
const AddContentButton = ({ name, blockType } : AddContentButtonProps) => {
  const sectionsList = useSelector(getSectionsList);
  const lastSection = getLastEditableParent(sectionsList);
  const lastSubsection = getLastEditableParent(lastSection?.childInfo.children || []);
  const {
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
  } = useCourseAuthoringContext();

  const onCreateContent = useCallback(() => {
    switch (blockType) {
      case 'section':
        handleNewSectionSubmit();
        break;
      case 'subsection':
        if (lastSection) {
          handleNewSubsectionSubmit(lastSection.id);
        }
        break;
      case 'unit':
        if (lastSubsection) {
          handleNewUnitSubmit(lastSubsection.id);
        }
        break;
      default:
        // istanbul ignore next: unreachable
        throw new Error(`Unrecognized block type ${blockType}`);
    };
  }, [
    blockType,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
    lastSection,
    lastSubsection,
  ]);

  return (
    <Button
      variant="outline-primary"
      className="m-2"
      iconBefore={getItemIcon(blockType)}
      onClick={onCreateContent}
      disabled={(!lastSection && blockType==='subsection') || (!lastSubsection && blockType==='unit')}
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
        name={intl.formatMessage(contentMessages.sectionButton)}
        blockType='section'
      />
      <AddContentButton
        key="subsection"
        name={intl.formatMessage(contentMessages.subsectionButton)}
        blockType='subsection'
      />
      <AddContentButton
        key="unit"
        name={intl.formatMessage(contentMessages.unitButton)}
        blockType='unit'
      />
    </Stack>
  );
}

/** Add Existing Content Tab Section */
const ShowLibraryContent = () => {
  const sectionsList: Array<XBlock> = useSelector(getSectionsList);
  const lastSection = getLastEditableParent(sectionsList);
  const lastSubsection = getLastEditableParent(lastSection?.childInfo.children || []);
  const {
    courseUsageKey,
    handleAddSectionFromLibrary,
    handleAddSubsectionFromLibrary,
    handleAddUnitFromLibrary,
  } = useCourseAuthoringContext();

  const onComponentSelected: ComponentSelectedEvent = useCallback(({ usageKey, blockType }) => {
    switch (blockType) {
      case 'section':
        handleAddSectionFromLibrary.mutateAsync({
          type: COMPONENT_TYPES.libraryV2,
          category: ContainerType.Chapter,
          parentLocator: courseUsageKey,
          libraryContentKey: usageKey,
        });
        break;
      case 'subsection':
        if (lastSection) {
          handleAddSubsectionFromLibrary.mutateAsync({
            type: COMPONENT_TYPES.libraryV2,
            category: ContainerType.Sequential,
            parentLocator: lastSection.id,
            libraryContentKey: usageKey,
          });
        }
        break;
      case 'unit':
        if (lastSubsection) {
          handleAddUnitFromLibrary.mutateAsync({
            type: COMPONENT_TYPES.libraryV2,
            category: ContainerType.Vertical,
            parentLocator: lastSubsection.id,
            libraryContentKey: usageKey,
          });
        }
        break;
      default:
        // istanbul ignore next: unreachable
        throw new Error(`Unrecognized block type ${blockType}`);
    };
  }, [
    courseUsageKey,
    handleAddSectionFromLibrary,
    handleAddSubsectionFromLibrary,
    handleAddUnitFromLibrary,
    lastSection,
    lastSubsection,
  ]);

  const allowedBlocks = useMemo(() => {
    let blocks: ContainerTypes[] = ['section'];
    if (lastSection) blocks.push('subsection');
    if (lastSubsection) blocks.push('unit');
    return blocks;
  }, [lastSection, lastSubsection, sectionsList]);

  return (
    <ComponentPicker
      showOnlyPublished
      extraFilter={[`block_type IN [${allowedBlocks.join(',')}]`]}
      libraryIds={[]}
      selectLibrary={false}
      visibleTabs={[ContentType.home]}
      FiltersComponent={SidebarFilters}
      onComponentSelected={onComponentSelected}
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
        <SidebarSection>
          <AddTabs />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
