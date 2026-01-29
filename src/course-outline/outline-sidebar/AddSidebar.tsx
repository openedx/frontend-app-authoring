import { useIntl } from '@edx/frontend-platform/i18n';
import { InfoOutline, SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import contentMessages from '@src/library-authoring/add-content/messages';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { SidebarFilters } from '@src/library-authoring/library-filters/SidebarFilters';
import {
  Button, Icon, Stack, Tab, Tabs,
} from '@openedx/paragon';
import { getIconBorderStyleColor, getItemIcon } from '@src/generic/block-type-utils';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { ComponentSelectedEvent } from '@src/library-authoring/common/context/ComponentPickerContext';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { ContainerType, normalizeContainerType } from '@src/generic/key-utils';
import { ContentType } from '@src/library-authoring/routes';
import { ComponentPicker } from '@src/library-authoring';
import { MultiLibraryProvider } from '@src/library-authoring/common/context/MultiLibraryContext';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import messages from './messages';
import { useOutlineSidebarContext } from './OutlineSidebarContext';
import AlertMessage from '@src/generic/alert-message';


const CannotAddContentAlert = () => {
  const intl = useIntl();
  const { currentItemData } = useOutlineSidebarContext();
  return (
    <AlertMessage
      variant='info'
      description={intl.formatMessage(messages.cannotAddAlertMsg, {
        name: currentItemData?.displayName,
        category: normalizeContainerType(currentItemData?.category || ''),
      })}
      icon={InfoOutline}
    />
  );
}

type AddContentButtonProps = {
  name: string,
  blockType: ContainerType,
};

/** Add Content Button */
const AddContentButton = ({ name, blockType } : AddContentButtonProps) => {
  const {
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddAndOpenUnit,
  } = useCourseAuthoringContext();
  const {
    currentFlow,
    stopCurrentFlow,
    lastEditableSection,
    lastEditableSubsection,
    currentItemData,
    openContainerInfoSidebar,
  } = useOutlineSidebarContext();
  const sectionParentId = currentFlow?.parentLocator || lastEditableSection?.id;
  const subsectionParentId = currentFlow?.parentLocator || lastEditableSubsection?.id;

  const onCreateContent = useCallback(async () => {
    switch (blockType) {
      case 'section':
        await handleAddSection.mutateAsync({
          type: ContainerType.Chapter,
          parentLocator: courseUsageKey,
          displayName: COURSE_BLOCK_NAMES.chapter.name,
        }, {
          onSuccess: (data: { locator: string; }) => openContainerInfoSidebar(
            data.locator,
            undefined,
            data.locator,
          )
        });
        break;
      case 'subsection':
        if (sectionParentId) {
          await handleAddSubsection.mutateAsync({
            type: ContainerType.Sequential,
            parentLocator: sectionParentId,
            displayName: COURSE_BLOCK_NAMES.sequential.name,
          }, {
            onSuccess: (data: { locator: string; }) => openContainerInfoSidebar(
              data.locator,
              data.locator,
              sectionParentId,
            )
          });
        }
        break;
      case 'unit':
        if (subsectionParentId) {
          await handleAddAndOpenUnit.mutateAsync({
            type: ContainerType.Vertical,
            parentLocator: subsectionParentId,
            displayName: COURSE_BLOCK_NAMES.vertical.name,
          });
        }
        break;
      default:
        // istanbul ignore next: unreachable
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unrecognized block type ${blockType}`);
    }
    stopCurrentFlow();
  }, [
    blockType,
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddAndOpenUnit,
    currentFlow,
    lastEditableSection,
    lastEditableSubsection,
  ]);

  const enabled = useMemo(() => {
    return (
      (currentFlow)
      || (blockType === 'subsection' &&  lastEditableSection)
      || (blockType === 'unit' && lastEditableSubsection)
      || (blockType === 'section' && !currentItemData)
    )
  }, [
    currentFlow,
    blockType,
    currentItemData,
    lastEditableSection,
    lastEditableSubsection,
  ]);

  return (
    <Button
      variant="tertiary shadow"
      className="mx-2 justify-content-start px-4 font-weight-bold"
      onClick={onCreateContent}
      disabled={!enabled}
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
  const { currentFlow, currentItemData } = useOutlineSidebarContext();
  const btns = useCallback(() => {
    if (currentFlow?.flowType) {
      return (
        <AddContentButton
          name={intl.formatMessage(contentMessages[`${currentFlow.flowType}Button`])}
          blockType={currentFlow.flowType}
        />
      );
    }
    return (
      <>
        <AddContentButton
          name={intl.formatMessage(contentMessages.sectionButton)}
          blockType={ContainerType.Section}
        />
        <AddContentButton
          name={intl.formatMessage(contentMessages.subsectionButton)}
          blockType={ContainerType.Subsection}
        />
        <AddContentButton
          name={intl.formatMessage(contentMessages.unitButton)}
          blockType={ContainerType.Unit}
        />
      </>
    );
  }, [currentFlow, intl]);

  if (currentItemData && !currentItemData.actions.childAddable) {
    return <CannotAddContentAlert />
  }

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
  const {
    currentFlow,
    stopCurrentFlow,
    lastEditableSection,
    lastEditableSubsection,
    selectedContainerState,
    currentItemData,
  } = useOutlineSidebarContext();

  const sectionParentId = currentFlow?.parentLocator || lastEditableSection?.id;
  const subsectionParentId = currentFlow?.parentLocator || lastEditableSubsection?.id;

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
        // istanbul ignore next: should not happen
        throw new Error(`Unrecognized block type ${blockType}`);
    }
    stopCurrentFlow();
  }, [
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
    lastEditableSection,
    lastEditableSubsection,
    currentFlow,
    stopCurrentFlow,
  ]);

  const allowedBlocks = useMemo(() => {
    const blocks: ContainerType[] = [];
    if (currentFlow?.flowType) {
        return [currentFlow.flowType];
    }
    if (!selectedContainerState) { blocks.push(ContainerType.Section); }
    if (lastEditableSection) { blocks.push(ContainerType.Subsection); }
    if (lastEditableSubsection) { blocks.push(ContainerType.Unit); }
    return blocks;
  }, [lastEditableSection, lastEditableSubsection, currentFlow]);

  if (currentItemData && !currentItemData.actions.childAddable) {
    return <CannotAddContentAlert />
  }

  return (
    <MultiLibraryProvider>
      <ComponentPicker
        showOnlyPublished
        extraFilter={[`block_type IN ["${allowedBlocks.join('","')}"]`]}
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
  const { currentFlow, currentItemData } = useOutlineSidebarContext();
  const titleAndIcon = useMemo(() => {
    if (currentFlow?.flowType) {
      return { title: currentFlow.parentTitle, icon: getItemIcon(currentFlow.flowType) };
    }
    if (currentItemData) {
      return { title: currentItemData.displayName, icon: getItemIcon(currentItemData.category) };
    }
    return { title: courseDetails?.name || '', icon: SchoolOutline };
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
