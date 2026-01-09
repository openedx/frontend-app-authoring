import { Button, Col, Row, Stack } from '@openedx/paragon';
import { Add as IconAdd, Newsstand } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getStudioHomeData } from '@src/studio-home/data/selectors';
import { ContainerType } from '@src/generic/key-utils';
import messages from './messages';
import { OutlineFlowType, useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCallback } from 'react';
import { COURSE_BLOCK_NAMES } from '@src/constants';


const AddPlaceholder = ({ parentLocator }: { parentLocator?: string }) => {
  const intl = useIntl();
  const { currentFlow } = useOutlineSidebarContext();
  const {
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
  } = useCourseAuthoringContext();

  if (!currentFlow || currentFlow.parentLocator !== parentLocator) {
    return null;
  }

  const getTitle = () => {
    switch (currentFlow?.flowType) {
      case 'use-section':
        return intl.formatMessage(messages.placeholderSectionText);
      case 'use-subsection':
        return intl.formatMessage(messages.placeholderSubsectionText);
      case 'use-unit':
        return intl.formatMessage(messages.placeholderUnitText);
      default:
        throw new Error('Unknown flow type');
    }
  };

  return (
    <Row
      className="mx-0 py-3 px-4 border-dashed border-gray-500 shadow-lg rounded bg-white"
    >
      <Col className="py-3">
        <Stack direction="horizontal" gap={3}>
          {(handleAddSection.isPending
            || handleAddSubsection.isPending
            || handleAddUnit.isPending) && (
            <LoadingSpinner />
          )}
          <h3>{getTitle()}</h3>
        </Stack>
      </Col>
    </Row>
  );
};

interface NewChildButtonsProps {
  handleNewButtonClick?: () => void;
  handleUseFromLibraryClick?: () => void;
  onClickCard?: (e: React.MouseEvent) => void;
  childType: ContainerType;
  btnVariant?: string;
  btnClasses?: string;
  btnSize?: 'sm' | 'md' | 'lg' | 'inline';
  parentLocator: string;
  parentTitle: string;
}

const OutlineAddChildButtons = ({
  handleNewButtonClick,
  handleUseFromLibraryClick,
  onClickCard,
  childType,
  btnVariant = 'outline-primary',
  btnClasses = 'mt-4 border-gray-500 rounded-0',
  btnSize,
  parentLocator,
  parentTitle,
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
    handleAddUnit,
  } = useCourseAuthoringContext();
  const { startCurrentFlow } = useOutlineSidebarContext();
  let messageMap = {
    newButton: messages.newUnitButton,
    importButton: messages.useUnitFromLibraryButton,
  };

  switch (childType) {
    case ContainerType.Section:
      messageMap = {
        newButton: messages.newSectionButton,
        importButton: messages.useSectionFromLibraryButton,
      };
      break;
    case ContainerType.Subsection:
      messageMap = {
        newButton: messages.newSubsectionButton,
        importButton: messages.useSubsectionFromLibraryButton,
      };
      break;
    case ContainerType.Unit:
      messageMap = {
        newButton: messages.newUnitButton,
        importButton: messages.useUnitFromLibraryButton,
      };
      break;
    default:
      break;
  }

  const onNewCreateContent = useCallback(async () => {
    switch (childType) {
      case ContainerType.Section:
        await handleAddSection.mutateAsync({
          type: ContainerType.Chapter,
          parentLocator: courseUsageKey,
          displayName: COURSE_BLOCK_NAMES.chapter.name,
        });
        break;
      case ContainerType.Subsection:
        await handleAddSubsection.mutateAsync({
          type: ContainerType.Sequential,
          parentLocator,
          displayName: COURSE_BLOCK_NAMES.sequential.name,
        });
        break;
      case ContainerType.Unit:
        await handleAddUnit.mutateAsync({
          type: ContainerType.Vertical,
          parentLocator,
          displayName: COURSE_BLOCK_NAMES.vertical.name,
        });
        break;
      default:
        // istanbul ignore next: unreachable
        throw new Error(`Unrecognized block type ${childType}`);
    }
  }, [
    childType,
    courseUsageKey,
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
  ]);

  const onUseLibraryContent = useCallback(async () => {
    let flowType: OutlineFlowType;
    switch (childType) {
      case ContainerType.Section:
        flowType = 'use-section';
        break;
      case ContainerType.Subsection:
        flowType = 'use-subsection';
        break;
      case ContainerType.Unit:
        flowType = 'use-unit';
        break;
      default:
        // istanbul ignore next: unreachable
        throw new Error(`Unrecognized block type ${childType}`);
    }
    startCurrentFlow({
      flowType,
      parentLocator,
      parentTitle,
    })
  }, [
    childType,
    parentLocator,
    parentTitle,
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

export default OutlineAddChildButtons;
