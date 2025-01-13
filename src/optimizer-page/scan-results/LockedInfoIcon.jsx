import {
  Icon,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import {
  Question,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const LockedInfoIcon = () => {
  const intl = useIntl();

  return (
    <OverlayTrigger
      key="top"
      placement="top"
      overlay={(
        <Tooltip variant="light" id="tooltip-top">
          {intl.formatMessage(messages.lockedInfoTooltip)}
        </Tooltip>
    )}
    >
      <Icon src={Question} />
    </OverlayTrigger>
  );
};

export default LockedInfoIcon;
