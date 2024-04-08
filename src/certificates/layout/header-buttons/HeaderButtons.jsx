import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Dropdown, DropdownButton, Hyperlink,
} from '@openedx/paragon';

import messages from '../../messages';
import useHeaderButtons from './hooks/useHeaderButtons';

const HeaderButtons = () => {
  const intl = useIntl();
  const {
    previewUrl,
    courseModes,
    dropdowmItem,
    isCertificateActive,
    setDropdowmItem,
    handleActivationStatus,
  } = useHeaderButtons();

  return (
    <>
      <DropdownButton id="dropdown-basic-button" title={dropdowmItem} onSelect={(item) => setDropdowmItem(item)}>
        {courseModes.map((mode) => <Dropdown.Item key={mode} eventKey={mode}>{mode}</Dropdown.Item>)}
      </DropdownButton>
      <Button
        variant="outline-primary"
        as={Hyperlink}
        destination={previewUrl}
        target="_blank"
        showLaunchIcon={false}
      >
        {intl.formatMessage(messages.headingActionsPreview)}
      </Button>
      <Button
        variant="outline-primary"
        onClick={handleActivationStatus}
      >
        {isCertificateActive
          ? intl.formatMessage(messages.headingActionsDeactivate)
          : intl.formatMessage(messages.headingActionsActivate)}
      </Button>
    </>
  );
};

export default HeaderButtons;
