import { Button, Stack } from '@openedx/paragon';
import { Add as IconAdd, Newsstand } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getStudioHomeData } from '@src/studio-home/data/selectors';
import { ContainerType } from '@src/generic/key-utils';
import messages from './messages';

interface NewChildButtonsProps {
  handleNewButtonClick: () => void;
  handleUseFromLibraryClick: () => void;
  childType: ContainerType;
  btnVariant?: string;
  btnClasses?: string;
  btnSize?: 'sm' | 'md' | 'lg' | 'inline';
}

const OutlineAddChildButtons = ({
  handleNewButtonClick,
  handleUseFromLibraryClick,
  childType,
  btnVariant = 'outline-primary',
  btnClasses = 'mt-4 border-gray-500 rounded-0',
  btnSize,
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
    <Stack direction="horizontal" gap={3}>
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
  );
};

export default OutlineAddChildButtons;
