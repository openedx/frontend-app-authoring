/* eslint-disable react/prop-types */
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { LinkOff, Newsstand } from '@openedx/paragon/icons';

import messages from './messages';

export interface UpstreamInfoIconProps {
  upstreamInfo?: {
    errorMessage?: string | null;
    upstreamRef?: string | null;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'inline';
}

export const UpstreamInfoIcon: React.FC<UpstreamInfoIconProps> = ({ upstreamInfo, size }) => {
  const intl = useIntl();
  if (!upstreamInfo?.upstreamRef) {
    return null;
  }

  const iconProps = !upstreamInfo?.errorMessage
    ? {
      title: intl.formatMessage(messages.upstreamLinkOk),
      ariaLabel: intl.formatMessage(messages.upstreamLinkOk),
      src: Newsstand,
    }
    : {
      title: intl.formatMessage(messages.upstreamLinkError),
      ariaLabel: intl.formatMessage(messages.upstreamLinkError),
      src: LinkOff,
    };

  return (
    <Icon
      {...iconProps}
      size={size}
      className="mr-1"
    />
  );
};
