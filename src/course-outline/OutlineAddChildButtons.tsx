import {
  Button, Col, IconButton, Row, Stack, StandardModal, useToggle,
} from '@openedx/paragon';
import { Add as IconAdd, Close, Newsstand } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getStudioHomeData } from '@src/studio-home/data/selectors';
import { ContainerType } from '@src/generic/key-utils';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCallback } from 'react';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { LibraryAndComponentPicker, type SelectedComponent } from '@src/library-authoring';
import { ContentType } from '@src/library-authoring/routes';
import { isOutlineNewDesignEnabled } from '@src/course-outline/utils';
import messages from './messages';

/**
 * Placeholder component that is displayed when a user clicks the "Use content from library" button.
 * Shows a loading spinner when the component is selected and being added to the course.
 * Finally it is hidden once the add component operation is complete and the content is successfully
 * added to the course.
 * @param props.parentLocator The locator of the parent flow item to which the content will be added.
 */
const AddPlaceholder = ({ parentLocator }: { parentLocator?: string }) => {
  const intl = useIntl();
  const { isCurrentFlowOn, currentFlow, stopCurrentFlow } = useOutlineSidebarContext();
  const {
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
    handleAddAndOpenUnit,
  } = useCourseAuthoringContext();

  if (!isCurrentFlowOn || currentFlow?.parentLocator !== parentLocator) {
    return null;
  }

  const getTitle = () => {
    switch (currentFlow?.flowType) {
      case ContainerType.Section:
        return intl.formatMessage(messages.placeholderSectionText);
      case ContainerType.Subsection:
        return intl.formatMessage(messages.placeholderSubsectionText);
      case ContainerType.Unit:
        return intl.formatMessage(messages.placeholderUnitText);
      default:
        // istanbul ignore next: this should never happen
        throw new Error('Unknown flow type');
    }
  };

  return (
    <Row
      className="mx-0 py-3 px-4 border-dashed border-gray-500 shadow-lg rounded bg-white w-100"
    >
      <Col className="py-3">
        <Stack direction="horizontal" gap={3}>
          {(handleAddSection.isPending
            || handleAddSubsection.isPending
            || handleAddAndOpenUnit.isPending
            || handleAddUnit.isPending) && (
            <LoadingSpinner />
          )}
          <h3 className="mb-0">{getTitle()}</h3>
          <IconButton
            src={Close}
            alt="Close"
            onClick={stopCurrentFlow}
            variant="dark"
            className="ml-auto"
          />
        </Stack>
      </Col>
    </Row>
  );
};

interface BaseProps {
  handleNewButtonClick?: () => void;
  onClickCard?: (e: React.MouseEvent) => void;
  childType: ContainerType;
  btnVariant?: string;
  btnClasses?: string;
  btnSize?: 'sm' | 'md' | 'lg' | 'inline';
  parentLocator: string;
}

interface NewChildButtonsProps extends BaseProps {
  handleUseFromLibraryClick?: () => void;
  grandParentLocator?: string;
}

const NewOutlineAddChildButtons = ({
  handleNewButtonClick,
  handleUseFromLibraryClick,
  onClickCard,
  childType,
  btnVariant = 'outline-primary',
  btnClasses = 'mt-4 border-gray-500 rounded-0',
  btnSize,
  parentLocator,
  grandParentLocator,
}: NewChildButtonsProps) => {
  // WARNING: Do not use "useStudioHome" to get "librariesV2Enabled" flag below,
  // as it has a useEffect that fetches course waffle flags whenever
  // location.search is updated. Course search updates location.search when
  // user types, which will then trigger the useEffect and reload the page.
  // See https://github.com/openedx/frontend-app-authoring/pull/1938.
  const { librariesV2Enabled } = useSelector(getStudioHomeData);
  const intl = useIntl();
  const {
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddAndOpenUnit,
  } = useCourseAuthoringContext();
  const { startCurrentFlow } = useOutlineSidebarContext();
  let messageMap = {
    newButton: messages.newUnitButton,
    importButton: messages.useUnitFromLibraryButton,
  };
  let onNewCreateContent: () => Promise<void>;
  let flowType: ContainerType;

  // Based on the childType, determine the correct action and messages to display.
  switch (childType) {
    case ContainerType.Section:
      messageMap = {
        newButton: messages.newSectionButton,
        importButton: messages.useSectionFromLibraryButton,
      };
      onNewCreateContent = () => handleAddSection.mutateAsync({
        type: ContainerType.Chapter,
        parentLocator: courseUsageKey,
        displayName: COURSE_BLOCK_NAMES.chapter.name,
      });
      flowType = ContainerType.Section;
      break;
    case ContainerType.Subsection:
      messageMap = {
        newButton: messages.newSubsectionButton,
        importButton: messages.useSubsectionFromLibraryButton,
      };
      onNewCreateContent = () => handleAddSubsection.mutateAsync({
        type: ContainerType.Sequential,
        parentLocator,
        displayName: COURSE_BLOCK_NAMES.sequential.name,
      });
      flowType = ContainerType.Subsection;
      break;
    case ContainerType.Unit:
      messageMap = {
        newButton: messages.newUnitButton,
        importButton: messages.useUnitFromLibraryButton,
      };
      onNewCreateContent = () => handleAddAndOpenUnit.mutateAsync({
        type: ContainerType.Vertical,
        parentLocator,
        displayName: COURSE_BLOCK_NAMES.vertical.name,
      });
      flowType = ContainerType.Unit;
      break;
    default:
      // istanbul ignore next: unreachable
      throw new Error(`Unrecognized block type ${childType}`);
  }

  /**
  * Starts add flow in sidebar when `Use content from library` button is clicked.
  */
  const onUseLibraryContent = useCallback(async () => {
    startCurrentFlow({
      flowType,
      parentLocator,
      grandParentLocator,
    });
  }, [
    childType,
    parentLocator,
    grandParentLocator,
    startCurrentFlow,
  ]);

  return (
    <>
      <AddPlaceholder parentLocator={parentLocator} />
      <Stack direction="horizontal" gap={3} onClick={onClickCard}>
        <Button
          className={btnClasses}
          variant={btnVariant}
          iconBefore={IconAdd}
          size={btnSize}
          block
          onClick={handleNewButtonClick || onNewCreateContent}
        >
          {intl.formatMessage(messageMap.newButton)}
        </Button>
        {librariesV2Enabled && (
          <Button
            className={btnClasses}
            variant={btnVariant}
            iconBefore={Newsstand}
            block
            size={btnSize}
            onClick={handleUseFromLibraryClick || onUseLibraryContent}
          >
            {intl.formatMessage(messageMap.importButton)}
          </Button>
        )}
      </Stack>
    </>
  );
};

/**
 * Legacy component for adding child blocks in Studio.
 * Uses the old flow of opening a modal to allow user to select content from library.
 */
const LegacyOutlineAddChildButtons = ({
  handleNewButtonClick,
  childType,
  btnVariant = 'outline-primary',
  btnClasses = 'mt-4 border-gray-500 rounded-0',
  btnSize,
  parentLocator,
  onClickCard,
}: BaseProps) => {
  // WARNING: Do not use "useStudioHome" to get "librariesV2Enabled" flag below,
  // as it has a useEffect that fetches course waffle flags whenever
  // location.search is updated. Course search updates location.search when
  // user types, which will then trigger the useEffect and reload the page.
  // See https://github.com/openedx/frontend-app-authoring/pull/1938.
  const { librariesV2Enabled } = useSelector(getStudioHomeData);
  const intl = useIntl();
  const {
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddAndOpenUnit,
  } = useCourseAuthoringContext();
  const [
    isAddLibrarySectionModalOpen,
    openAddLibrarySectionModal,
    closeAddLibrarySectionModal,
  ] = useToggle(false);
  let messageMap = {
    newButton: messages.newUnitButton,
    importButton: messages.useUnitFromLibraryButton,
    modalTitle: messages.unitPickerModalTitle,
  };
  let onNewCreateContent: () => Promise<void>;
  let onUseLibraryContent: (selected: SelectedComponent) => Promise<void>;
  let visibleTabs: ContentType[] = [];
  let query: string[] = [];

  switch (childType) {
    case ContainerType.Section:
      messageMap = {
        newButton: messages.newSectionButton,
        importButton: messages.useSectionFromLibraryButton,
        modalTitle: messages.sectionPickerModalTitle,
      };
      onNewCreateContent = () => handleAddSection.mutateAsync({
        type: ContainerType.Chapter,
        parentLocator: courseUsageKey,
        displayName: COURSE_BLOCK_NAMES.chapter.name,
      });
      onUseLibraryContent = (selected: SelectedComponent) => handleAddSection.mutateAsync({
        type: COMPONENT_TYPES.libraryV2,
        category: ContainerType.Chapter,
        parentLocator: courseUsageKey,
        libraryContentKey: selected.usageKey,
      });
      visibleTabs = [ContentType.sections];
      query = ['block_type = "section"'];
      break;
    case ContainerType.Subsection:
      messageMap = {
        newButton: messages.newSubsectionButton,
        importButton: messages.useSubsectionFromLibraryButton,
        modalTitle: messages.subsectionPickerModalTitle,
      };
      onNewCreateContent = () => handleAddSubsection.mutateAsync({
        type: ContainerType.Sequential,
        parentLocator,
        displayName: COURSE_BLOCK_NAMES.sequential.name,
      });
      onUseLibraryContent = (selected: SelectedComponent) => handleAddSubsection.mutateAsync({
        type: COMPONENT_TYPES.libraryV2,
        category: ContainerType.Sequential,
        parentLocator,
        libraryContentKey: selected.usageKey,
      });
      visibleTabs = [ContentType.subsections];
      query = ['block_type = "subsection"'];
      break;
    case ContainerType.Unit:
      messageMap = {
        newButton: messages.newUnitButton,
        importButton: messages.useUnitFromLibraryButton,
        modalTitle: messages.unitPickerModalTitle,
      };
      onNewCreateContent = () => handleAddAndOpenUnit.mutateAsync({
        type: ContainerType.Vertical,
        parentLocator,
        displayName: COURSE_BLOCK_NAMES.vertical.name,
      });
      onUseLibraryContent = (selected: SelectedComponent) => handleAddAndOpenUnit.mutateAsync({
        type: COMPONENT_TYPES.libraryV2,
        category: ContainerType.Vertical,
        parentLocator,
        libraryContentKey: selected.usageKey,
      });
      visibleTabs = [ContentType.units];
      query = ['block_type = "unit"'];
      break;
    default:
      // istanbul ignore next: unreachable
      throw new Error(`Unrecognized block type ${childType}`);
  }

  const handleOnComponentSelected = (selected: SelectedComponent) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    onUseLibraryContent(selected);
    closeAddLibrarySectionModal();
  };

  return (
    <>
      <Stack direction="horizontal" gap={3} onClick={onClickCard}>
        <Button
          className={btnClasses}
          variant={btnVariant}
          iconBefore={IconAdd}
          size={btnSize}
          block
          onClick={handleNewButtonClick || onNewCreateContent}
        >
          {intl.formatMessage(messageMap.newButton)}
        </Button>
        {librariesV2Enabled && (
          <Button
            className={btnClasses}
            variant={btnVariant}
            iconBefore={Newsstand}
            block
            size={btnSize}
            onClick={openAddLibrarySectionModal}
          >
            {intl.formatMessage(messageMap.importButton)}
          </Button>
        )}
      </Stack>
      <StandardModal
        title={intl.formatMessage(messageMap.modalTitle)}
        isOpen={isAddLibrarySectionModalOpen}
        onClose={closeAddLibrarySectionModal}
        isOverflowVisible={false}
        size="xl"
      >
        <LibraryAndComponentPicker
          showOnlyPublished
          extraFilter={query}
          componentPickerMode="single"
          onComponentSelected={handleOnComponentSelected}
          visibleTabs={visibleTabs}
        />
      </StandardModal>
    </>
  );
};

/**
 * Wrapper component that displays the correct component based on the configuration.
 */
const OutlineAddChildButtons = (props: NewChildButtonsProps) => {
  const showNewActionsBar = isOutlineNewDesignEnabled();
  if (showNewActionsBar) {
    return (
      <NewOutlineAddChildButtons {...props} />
    );
  }
  return (
    <LegacyOutlineAddChildButtons {...props} />
  );
};

export default OutlineAddChildButtons;
