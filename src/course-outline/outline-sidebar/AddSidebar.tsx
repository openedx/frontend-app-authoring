import { useIntl } from '@edx/frontend-platform/i18n';
import { InfoOutline, SchoolOutline } from '@openedx/paragon/icons';

import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';

import contentMessages from '@src/library-authoring/add-content/messages';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { SidebarFilters } from '@src/library-authoring/library-filters/SidebarFilters';
import {
  Stack, Tab, Tabs,
} from '@openedx/paragon';
import { getItemIcon } from '@src/generic/block-type-utils';
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
import { BlockCardButton } from '@src/generic/sidebar/BlockCardButton';
import AlertMessage from '@src/generic/alert-message';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { useOutlineSidebarContext } from './OutlineSidebarContext';
import messages from './messages';

const CannotAddContentAlert = () => {
  const intl = useIntl();
  const { currentItemData } = useOutlineSidebarContext();
  return (
    <AlertMessage
      variant="info"
      description={intl.formatMessage(messages.cannotAddAlertMsg, {
        name: currentItemData?.displayName,
        category: normalizeContainerType(currentItemData?.category || ''),
      })}
      icon={InfoOutline}
    />
  );
};

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
    openContainerInfoSidebar,
  } = useOutlineSidebarContext();
  let sectionParentId = lastEditableSection?.id;
  let subsectionParentId = lastEditableSubsection?.data?.id;

  const addSection = (onSuccess?: (data: { locator: string; }) => void) => {
    handleAddSection.mutate({
      type: ContainerType.Chapter,
      parentLocator: courseUsageKey,
      displayName: COURSE_BLOCK_NAMES.chapter.name,
    }, {
      onSuccess: (data: { locator: string; }) => {
        // istanbul ignore next
        if (onSuccess) {
          onSuccess(data);
        } else {
          openContainerInfoSidebar(data.locator, undefined, data.locator);
        }
      },
    });
  };

  const addSubsection = (sectionId: string, onSuccess?: (data: { locator: string; }) => void) => {
    handleAddSubsection.mutate({
      type: ContainerType.Sequential,
      parentLocator: sectionId,
      displayName: COURSE_BLOCK_NAMES.sequential.name,
    }, {
      onSuccess: (data: { locator: string; }) => {
        // istanbul ignore next
        if (onSuccess) {
          onSuccess(data);
        } else {
          openContainerInfoSidebar(data.locator, data.locator, sectionId);
        }
      },
    });
  };

  const addUnit = (subsectionId: string, sectionId?: string) => {
    handleAddAndOpenUnit.mutate({
      type: ContainerType.Vertical,
      parentLocator: subsectionId,
      displayName: COURSE_BLOCK_NAMES.vertical.name,
      sectionId,
    });
  };

  const onCreateContent = useCallback(async () => {
    switch (blockType) {
      case 'section':
        addSection();
        break;
      case 'subsection':
        sectionParentId = currentFlow?.parentLocator || sectionParentId;
        if (sectionParentId) {
          addSubsection(sectionParentId);
        } else {
          addSection(({ locator }) => addSubsection(locator));
        }
        break;
      case 'unit':
        sectionParentId = (
          currentFlow?.grandParentLocator || lastEditableSubsection?.sectionId || sectionParentId
        );
        subsectionParentId = currentFlow?.parentLocator || subsectionParentId;
        if (subsectionParentId) {
          addUnit(subsectionParentId, sectionParentId);
        } else if (sectionParentId) {
          addSubsection(sectionParentId, ({ locator }) => addUnit(locator));
        } else {
          addSection(({ locator: sectionId }) => {
            addSubsection(sectionId, ({ locator: subsectionId }) => {
              addUnit(subsectionId, sectionId);
            });
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
    sectionParentId,
    subsectionParentId,
    lastEditableSubsection,
  ]);

  const disabled = handleAddSection.isPending || handleAddSubsection.isPending || handleAddAndOpenUnit.isPending;

  return (
    <BlockCardButton
      name={name}
      blockType={blockType}
      onClick={onCreateContent}
      disabled={disabled}
    />
  );
};

/** Add New Content Tab Section */
const AddNewContent = () => {
  const intl = useIntl();
  const { isCurrentFlowOn, currentFlow, currentItemData } = useOutlineSidebarContext();
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

  if (!isCurrentFlowOn && currentItemData && !currentItemData.actions.childAddable) {
    return <CannotAddContentAlert />;
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
    isCurrentFlowOn,
    currentFlow,
    stopCurrentFlow,
    lastEditableSection,
    lastEditableSubsection,
    selectedContainerState,
    currentItemData,
  } = useOutlineSidebarContext();

  let sectionParentId = lastEditableSection?.id;
  let subsectionParentId = lastEditableSubsection?.data?.id;

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
        sectionParentId = currentFlow?.parentLocator || sectionParentId;
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
        sectionParentId = (
          currentFlow?.grandParentLocator || lastEditableSubsection?.sectionId || sectionParentId
        );
        subsectionParentId = currentFlow?.parentLocator || subsectionParentId;
        if (subsectionParentId) {
          await handleAddUnit.mutateAsync({
            type: COMPONENT_TYPES.libraryV2,
            category: ContainerType.Vertical,
            parentLocator: subsectionParentId,
            libraryContentKey: usageKey,
            sectionId: sectionParentId,
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

  if (!isCurrentFlowOn && currentItemData && !currentItemData.actions.childAddable) {
    return <CannotAddContentAlert />;
  }

  return (
    <MultiLibraryProvider>
      <ComponentPicker
        showOnlyPublished
        extraFilter={[
          `block_type IN ["${allowedBlocks.join('","')}"]`,
          'type = "library_container"',
        ]}
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
  const { isCurrentFlowOn } = useOutlineSidebarContext();
  const [key, setKey] = useState('addNew');
  useEffect(() => {
    if (isCurrentFlowOn) {
      setKey('addExisting');
    }
  }, [isCurrentFlowOn, setKey]);

  return (
    <Tabs
      variant="tabs"
      className="mb-4 mx-n4.5"
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
  const {
    isCurrentFlowOn,
    currentFlow,
    currentItemData,
    clearSelection,
    stopCurrentFlow,
    selectedContainerState,
  } = useOutlineSidebarContext();
  const { data: flowData } = useCourseItemData(currentFlow?.parentLocator);
  const titleAndIcon = useMemo(() => {
    if (isCurrentFlowOn && currentFlow) {
      return { title: flowData?.displayName || '', icon: getItemIcon(flowData?.category || '') };
    }
    if (currentItemData) {
      return { title: currentItemData.displayName, icon: getItemIcon(currentItemData.category) };
    }
    return { title: courseDetails?.name || '', icon: SchoolOutline };
  }, [
    isCurrentFlowOn,
    flowData,
    currentFlow,
    intl,
    getItemIcon,
    currentItemData,
    courseDetails,
  ]);

  const handleBack = () => {
    clearSelection();
    stopCurrentFlow();
  };

  return (
    <div>
      <SidebarTitle
        title={titleAndIcon.title}
        icon={titleAndIcon.icon}
        onBackBtnClick={(selectedContainerState || isCurrentFlowOn) ? handleBack : undefined}
      />
      <SidebarContent>
        <SidebarSection>
          <AddTabs />
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
