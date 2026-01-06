import { Button, Col, Row, Stack } from '@openedx/paragon';
import { Add as IconAdd, Newsstand } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getStudioHomeData } from '@src/studio-home/data/selectors';
import { ContainerType } from '@src/generic/key-utils';
import messages from './messages';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useMemo } from 'react';
import { LoadingSpinner } from '@src/generic/Loading';


const AddPlaceholder = ({ parentLocator }: { parentLocator?: string }) => {
  const intl = useIntl();
  const { currentFlow } = useOutlineSidebarContext();
  const {
    handleAddSectionFromLibrary,
    handleAddSubsectionFromLibrary,
    handleAddUnitFromLibrary,
  } = useCourseAuthoringContext();

  if (!currentFlow || currentFlow.parentLocator !== parentLocator) {
    return null;
  }

  const title = useMemo(() => {
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
  }, [currentFlow]);

  return (
    <Row
      className="mx-0 py-3 px-4 border-dashed border-gray-500 shadow-lg rounded bg-white"
    >
      <Col className="py-3">
        <Stack direction="horizontal" gap={3}>
          {(handleAddSectionFromLibrary.isPending || handleAddSubsectionFromLibrary.isPending || handleAddUnitFromLibrary.isPending) && (
            <LoadingSpinner />
          )}
          <h3>{title}</h3>
        </Stack>
      </Col>
    </Row>
  );
};

interface NewChildButtonsProps {
  handleNewButtonClick: () => void;
  handleUseFromLibraryClick: () => void;
  onClickCard?: (e: React.MouseEvent) => void;
  childType: ContainerType;
  btnVariant?: string;
  btnClasses?: string;
  btnSize?: 'sm' | 'md' | 'lg' | 'inline';
  parentLocator?: string;
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
}: NewChildButtonsProps) => {
  // WARNING: Do not use "useStudioHome" to get "librariesV2Enabled" flag below,
  // as it has a useEffect that fetches course waffle flags whenever
  // location.search is updated. Course search updates location.search when
  // user types, which will then trigger the useEffect and reload the page.
  // See https://github.com/openedx/frontend-app-authoring/pull/1938.
  const { librariesV2Enabled } = useSelector(getStudioHomeData);
  const intl = useIntl();
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
          onClick={handleNewButtonClick}
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
            onClick={handleUseFromLibraryClick}
          >
            {intl.formatMessage(messageMap.importButton)}
          </Button>
        )}
      </Stack>
    </>
  );
};

export const OutlineAddSectionButtons = (props: Partial<NewChildButtonsProps>) =>  {
  const { startCurrentFlow } = useOutlineSidebarContext();
  const { handleNewSectionSubmit } = useCourseAuthoringContext();
  return (
    <OutlineAddChildButtons
      handleNewButtonClick={handleNewSectionSubmit}
      handleUseFromLibraryClick={() => startCurrentFlow({
        flowType: 'use-section',
      })}
      childType={ContainerType.Section}
      {...props}
    />
  );
}

export default OutlineAddChildButtons;
