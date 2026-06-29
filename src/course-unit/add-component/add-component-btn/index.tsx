import {
  Badge,
  Button,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import AddComponentIcon from './AddComponentIcon';

interface AddComponentButtonProps {
  type: string;
  displayName: string;
  onClick: () => void;
  beta?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
}

const AddComponentButton = ({
  type,
  displayName,
  onClick,
  beta = false,
  disabled = false,
  disabledReason = null,
}: AddComponentButtonProps) => {
  const intl = useIntl();

  const button = (
    <Button
      variant="outline-primary"
      className="add-component-button flex-column rounded-sm"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <AddComponentIcon type={type} />
      <span className="sr-only">{intl.formatMessage(messages.buttonText)}</span>
      <span className="small mt-2">{displayName}</span>
      {beta && <Badge className="pb-1 mt-1" variant="primary">Beta</Badge>}
    </Button>
  );

  if (disabled && disabledReason) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`disabled-${type}`}>{disabledReason}</Tooltip>}
      >
        <span>{button}</span>
      </OverlayTrigger>
    );
  }
  return button;
};

export default AddComponentButton;
