import type { ComponentType } from 'react';
import type { MessageDescriptor } from 'react-intl';
import type { Placement } from '@popperjs/core';
import {
  Icon,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

interface CustomIconProps {
  icon: ComponentType;
  message1: MessageDescriptor;
  message2: MessageDescriptor;
  placement?: Placement;
}

const CustomIcon = ({
  icon,
  message1,
  message2,
  placement = 'top',
}: CustomIconProps) => {
  const intl = useIntl();

  return (
    <OverlayTrigger
      key="top"
      placement={placement}
      overlay={
        <Tooltip id="tooltip-top" className={placement !== 'top' ? 'ml-3' : ''}>
          {intl.formatMessage(message1)}
          {message1 && <br />}
          {intl.formatMessage(message2)}
        </Tooltip>
      }
    >
      <Icon src={icon} style={{ color: '#000000' }} />
    </OverlayTrigger>
  );
};

export default CustomIcon;
