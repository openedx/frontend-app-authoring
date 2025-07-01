import { Button, Stack } from '@openedx/paragon';
import { Add as IconAdd, Newsstand } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getStudioHomeData } from '../studio-home/data/selectors';
import messages from './messages';
import { ContainerType } from '../generic/key-utils';

interface NewChildButtonsProps {
  handleNewButtonClick: () => void;
  handleUseFromLibraryClick: () => void;
  childType: ContainerType;
}

const OutlineAddChildButtons = ({
  handleNewButtonClick,
  handleUseFromLibraryClick,
  childType,
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
      }
      break;
    case ContainerType.Subsection:
      messageMap = {
        newButton: messages.newSubsectionButton,
        importButton: messages.useSubsectionFromLibraryButton,
      }
      break;
    default:
      break;
  }

  return (
    <Stack direction="horizontal" gap={3}>
      <Button
        data-testid="new-unit-button"
        className="mt-4 border-gray-500 rounded-0"
        variant="outline-primary"
        iconBefore={IconAdd}
        block
        onClick={handleNewButtonClick}
      >
        {intl.formatMessage(messageMap.newButton)}
      </Button>
      {librariesV2Enabled && (
        <Button
          data-testid="use-unit-from-library"
          className="mt-4 border-gray-500 rounded-0"
          variant="outline-primary"
          iconBefore={Newsstand}
          block
          onClick={handleUseFromLibraryClick}
        >
          {intl.formatMessage(messageMap.importButton)}
        </Button>
      )}
    </Stack>
  )
}

export default OutlineAddChildButtons
