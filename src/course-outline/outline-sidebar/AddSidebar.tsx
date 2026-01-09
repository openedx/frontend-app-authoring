import { useIntl } from '@edx/frontend-platform/i18n';
import { SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import contentMessages from '@src/library-authoring/add-content/messages';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { SidebarFilters } from '@src/library-authoring/library-filters/SidebarFilters';
import {
  Button, Icon, Stack, Tab, Tabs,
} from '@openedx/paragon';
import { getIconBorderStyleColor, getItemIcon } from '@src/generic/block-type-utils';
import { useSelector } from 'react-redux';
import { getSectionsList } from '@src/course-outline/data/selectors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentSelectedEvent } from '@src/library-authoring/common/context/ComponentPickerContext';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { ContainerType } from '@src/generic/key-utils';
import type { XBlock } from '@src/data/types';
import { ContentType } from '@src/library-authoring/routes';
import { ComponentPicker } from '@src/library-authoring';
import { MultiLibraryProvider } from '@src/library-authoring/common/context/MultiLibraryContext';
import messages from './messages';
import { useOutlineSidebarContext } from './OutlineSidebarContext';
import { COURSE_BLOCK_NAMES } from '@src/constants';

type ContainerTypes = 'unit' | 'subsection' | 'section';

type AddContentButtonProps = {
  name: string,
  blockType: ContainerTypes,
};

const getLastEditableParent = (blockList: Array<XBlock>) => {
  let index = 1;
  let lastBlock: XBlock;
  while (index <= blockList.length) {
    lastBlock = blockList[blockList.length - index];
    if (lastBlock.actions.childAddable) {
      return lastBlock;
    }
    index++;
  }
  return undefined;
};

/** Add Content Button */
const AddContentButton = ({ name, blockType } : AddContentButtonProps) => {
  const sectionsList = useSelector(getSectionsList);
  const lastSection = getLastEditableParent(sectionsList);
  const lastSubsection = getLastEditableParent(lastSection?.childInfo.children || []);
  const { currentFlow, stopCurrentFlow } = useOutlineSidebarContext();
  const {
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
  } = useCourseAuthoringContext();

  const onCreateContent = useCallback(async () => {
    switch (blockType) {
      case 'section':
        await handleAddSection.mutateAsync({
          type: ContainerType.Chapter,
          parentLocator: courseUsageKey,
          displayName: COURSE_BLOCK_NAMES.chapter.name,
        });
        break;
      case 'subsection':
        const sectionParentId = currentFlow?.parentLocator || lastSection?.id;
        if (sectionParentId) {
          await handleAddSubsection.mutateAsync({
            type: ContainerType.Sequential,
            parentLocator: sectionParentId,
            displayName: COURSE_BLOCK_NAMES.sequential.name,
          });
        }
        break;
      case 'unit':
        const subsectionParentId = currentFlow?.parentLocator || lastSubsection?.id;
        if (subsectionParentId) {
          await handleAddUnit.mutateAsync({
            type: ContainerType.Vertical,
            parentLocator: subsectionParentId,
            displayName: COURSE_BLOCK_NAMES.vertical.name,
          });
        }
        break;
      default:
        // istanbul ignore next: unreachable
        throw new Error(`Unrecognized block type ${blockType}`);
    }
    stopCurrentFlow();
  }, [
    blockType,
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
    currentFlow,
    lastSection,
    lastSubsection,
  ]);

  return (
    <Button
      variant="tertiary shadow"
      className="mx-2 justify-content-start px-4 font-weight-bold"
      onClick={onCreateContent}
      disabled={(!lastSection && blockType === 'subsection') || (!lastSubsection && blockType === 'unit')}
    >
      <Stack direction="horizontal" gap={3}>
        <span className={`p-2 rounded ${getIconBorderStyleColor(blockType)}`}>
          <Icon size="lg" src={getItemIcon(blockType)} />
        </span>
        {name}
      </Stack>
    </Button>
  );
};

/** Add New Content Tab Section */
const AddNewContent = () => {
  const intl = useIntl();
  const { currentFlow } = useOutlineSidebarContext();
  const btns = useCallback(() => {
    switch (currentFlow?.flowType) {
      case 'use-section':
        return (
          <AddContentButton
            name={intl.formatMessage(contentMessages.sectionButton)}
            blockType="section"
          />
        );
      case 'use-subsection':
        return (
          <AddContentButton
            name={intl.formatMessage(contentMessages.subsectionButton)}
            blockType="subsection"
          />
        );
      case 'use-unit':
        return (
          <AddContentButton
            name={intl.formatMessage(contentMessages.unitButton)}
            blockType="unit"
          />
        );
      default:
        return (
          <>
            <AddContentButton
              name={intl.formatMessage(contentMessages.sectionButton)}
              blockType="section"
            />
            <AddContentButton
              name={intl.formatMessage(contentMessages.subsectionButton)}
              blockType="subsection"
            />
            <AddContentButton
              name={intl.formatMessage(contentMessages.unitButton)}
              blockType="unit"
            />
          </>
        );
    }
  }, [currentFlow, intl]);

  return (
    <Stack gap={2}>
      {btns()}
    </Stack>
  );
};

/** Add Existing Content Tab Section */
const ShowLibraryContent = () => {
  const {
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
  } = useCourseAuthoringContext();
  const sectionsList: Array<XBlock> = useSelector(getSectionsList);
  const { currentFlow, stopCurrentFlow } = useOutlineSidebarContext();

  const lastSection = getLastEditableParent(sectionsList);
  const lastSubsection = getLastEditableParent(lastSection?.childInfo.children || []);

  const onComponentSelected: ComponentSelectedEvent = useCallback(async ({ usageKey, blockType }) => {
    switch (blockType) {
      case 'section':
        await handleAddSection.mutateAsync({
          type: COMPONENT_TYPES.libraryV2,
          category: ContainerType.Chapter,
          parentLocator: courseUsageKey,
          libraryContentKey: usageKey,
        });
        break;
      case 'subsection':
        const sectionParentId = currentFlow?.parentLocator || lastSection?.id;
        if (sectionParentId) {
          await handleAddSubsection.mutateAsync({
            type: COMPONENT_TYPES.libraryV2,
            category: ContainerType.Sequential,
            parentLocator: sectionParentId,
            libraryContentKey: usageKey,
          });
        }
        break;
      case 'unit':
        const subsectionParentId = currentFlow?.parentLocator || lastSubsection?.id;
        if (subsectionParentId) {
          await handleAddUnit.mutateAsync({
            type: COMPONENT_TYPES.libraryV2,
            category: ContainerType.Vertical,
            parentLocator: subsectionParentId,
            libraryContentKey: usageKey,
          });
        }
        break;
      default:
        // istanbul ignore next: unreachable
        throw new Error(`Unrecognized block type ${blockType}`);
    }
    stopCurrentFlow();
  }, [
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
    lastSection,
    lastSubsection,
    currentFlow,
    stopCurrentFlow,
  ]);

  const allowedBlocks = useMemo(() => {
    switch (currentFlow?.flowType) {
      case 'use-section':
        return ['section'];
      case 'use-subsection':
        return ['subsection'];
      case 'use-unit':
        return ['unit'];
      default:
        const blocks: ContainerTypes[] = ['section'];
        if (lastSection) { blocks.push('subsection'); }
        if (lastSubsection) { blocks.push('unit'); }
        return blocks;
    }
  }, [lastSection, lastSubsection, sectionsList, currentFlow]);

  return (
    <MultiLibraryProvider>
      <ComponentPicker
        showOnlyPublished
        extraFilter={[`block_type IN [${allowedBlocks.join(',')}]`]}
        visibleTabs={[ContentType.home]}
        FiltersComponent={SidebarFilters}
        onComponentSelected={onComponentSelected}
      />
    </MultiLibraryProvider>
  );
};

/** Tabs Component */
const AddTabs = () => {
  const intl = useIntl();
  const { currentFlow } = useOutlineSidebarContext();
  const [key, setKey] = useState('addNew');
  useEffect(() => {
    if (currentFlow) {
      setKey('addExisting');
    }
  }, [currentFlow, setKey]);

  return (
    <Tabs
      variant="tabs"
      className="my-2 d-flex justify-content-around"
      id="add-content-tabs"
      activeKey={key}
      onSelect={setKey}
      mountOnEnter
    >
      <Tab eventKey="addNew" title={intl.formatMessage(messages.sidebarTabsAddNew)}>
        <AddNewContent />
      </Tab>
      <Tab eventKey="addExisting" title={intl.formatMessage(messages.sidebarTabsAddExisiting)}>
        <ShowLibraryContent />
      </Tab>
    </Tabs>
  );
};

/** Main Sidebar Component */
export const AddSidebar = () => {
  const intl = useIntl();
  const { courseDetails } = useCourseAuthoringContext();
  const { currentFlow } = useOutlineSidebarContext();
  const titleAndIcon = useMemo(() => {
    switch (currentFlow?.flowType) {
      case 'use-subsection':
        return { title: currentFlow.parentTitle, icon: getItemIcon('section') };
      case 'use-unit':
        return { title: currentFlow.parentTitle, icon: getItemIcon('subsection') };
      default:
        return { title: courseDetails?.name || '', icon: SchoolOutline };
    }
  }, [currentFlow, intl, getItemIcon]);

  return (
    <div>
      <SidebarTitle
        title={titleAndIcon.title}
        icon={titleAndIcon.icon}
      />
      <SidebarContent>
        <SidebarSection>
          <AddTabs />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
