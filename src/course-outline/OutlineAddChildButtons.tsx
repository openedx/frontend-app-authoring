import { Button, Col, IconButton, Row, Stack } from '@openedx/paragon';
import { Add as IconAdd, Close, Newsstand } from '@openedx/paragon/icons';
import { useIsMutating } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getStudioHomeData } from '@src/studio-home/data/selectors';
import { ContainerType } from '@src/generic/key-utils';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { LoadingSpinner } from '@src/generic/Loading';
import { useCallback } from 'react';
import {
  OUTLINE_CATEGORY_CONFIG,
  CONTAINER_CATEGORY_CONFIG,
} from './constants';
import { useCreateCourseBlock } from '@src/course-outline/data';
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import { useCreateBlockSidebar } from '@src/course-outline/state';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

/** Props for AddPlaceholder. */
interface AddPlaceholderProps {
  parentLocator?: string;
  isPending: boolean;
}

const AddPlaceholder = ({ parentLocator, isPending }: AddPlaceholderProps) => {
  const intl = useIntl();
  const { isCurrentFlowOn, currentFlow, stopCurrentFlow } = useOutlineSidebarContext();

  if (!isCurrentFlowOn || currentFlow?.parentLocator !== parentLocator) {
    return null;
  }

  const getTitle = () => {
    const flowType = currentFlow?.flowType;
    if (!flowType) {
      throw new Error('Unknown flow type');
    }
    const config = CONTAINER_CATEGORY_CONFIG[flowType];
    if (!config) {
      throw new Error('Unknown flow type');
    }
    return intl.formatMessage(config.placeholderMessage);
  };

  return (
    <Row className="mx-0 py-3 px-4 border-dashed border-gray-500 shadow-lg rounded bg-white w-100">
      <Col className="py-3">
        <Stack direction="horizontal" gap={3}>
          {isPending && <LoadingSpinner />}
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

interface ChildButtonsProps {
  handleNewButtonClick?: () => void;
  onClickCard?: (e: React.MouseEvent) => void;
  childType: ContainerType;
  btnVariant?: string;
  btnClasses?: string;
  btnSize?: 'sm' | 'md' | 'lg' | 'inline';
  parentLocator: string;
  grandParentLocator?: string;
}

const OutlineAddChildButtons = ({
  handleNewButtonClick,
  onClickCard,
  childType,
  btnVariant = 'outline-primary',
  btnClasses = 'mt-4 border-gray-500 rounded-0',
  btnSize,
  parentLocator,
  grandParentLocator,
}: ChildButtonsProps) => {
  // WARNING: Do not use "useStudioHome" to get "librariesV2Enabled" flag below,
  // as it has a useEffect that fetches course waffle flags whenever
  // location.search is updated. Course search updates location.search when
  // user types, which will then trigger the useEffect and reload the page.
  // See https://github.com/openedx/frontend-app-authoring/pull/1938.
  const { librariesV2Enabled } = useSelector(getStudioHomeData);
  const intl = useIntl();
  const { courseId, openUnitPage } = useCourseAuthoringContext();
  const handleAddAndOpenUnit = useCreateCourseBlock(courseId, openUnitPage);
  const { courseUsageKey } = useCourseOutlineContext();
  const { startCurrentFlow, openContainerInfoSidebar } = useOutlineSidebarContext();
  const { createSection, createSubsection } = useCreateBlockSidebar(
    courseId,
    courseUsageKey,
    openContainerInfoSidebar,
  );

  // Use global mutation state to track all createBlock mutations,
  // including those triggered from library add flows in other components
  const isCreatingBlock = useIsMutating({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(
      courseId,
      'createBlock',
    ),
  }) > 0;
  // Core config from single source of truth
  const categoryConfig = CONTAINER_CATEGORY_CONFIG[childType];
  if (!categoryConfig) {
    throw new Error(`Unrecognized block type ${childType}`);
  }

  const messageMap = {
    newButton: categoryConfig.newButtonMessage,
    importButton: categoryConfig.importButtonMessage,
  };
  const flowType = childType;

  // Create callbacks stay local — they depend on component-specific hooks
  const createContentMap: Record<string, () => Promise<unknown>> = {
    [ContainerType.Section]: async () => {
      await createSection();
    },
    [ContainerType.Subsection]: async () => {
      await createSubsection(parentLocator);
    },
    [ContainerType.Unit]: () =>
      handleAddAndOpenUnit.mutateAsync({
        type: ContainerType.Vertical,
        parentLocator,
        displayName: OUTLINE_CATEGORY_CONFIG.vertical.name,
        sectionId: grandParentLocator,
      }),
  };
  const onNewCreateContent = createContentMap[childType];
  if (!onNewCreateContent) {
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
  }, [childType, parentLocator, grandParentLocator, startCurrentFlow]);

  return (
    <>
      <AddPlaceholder
        parentLocator={parentLocator}
        isPending={isCreatingBlock}
      />
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
            onClick={onUseLibraryContent}
          >
            {intl.formatMessage(messageMap.importButton)}
          </Button>
        )}
      </Stack>
    </>
  );
};

export default OutlineAddChildButtons;
