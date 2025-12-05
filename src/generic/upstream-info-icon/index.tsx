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

  let hasTwoIcons = false;
  if (upstreamInfo?.errorMessage) {
    hasTwoIcons = true;
  }

  return (
    <div className={`upstream-info-icon size-${hasTwoIcons ? 'two' : 'one'}-${size} box-shadow-centered-1 d-flex justify-content-center`}>
      <Icon
        title={intl.formatMessage(messages.upstreamLinkOk)}
        aria-label={intl.formatMessage(messages.upstreamLinkOk)}
        src={Newsstand}
        size={size}
      />
      {upstreamInfo?.errorMessage && (
        <Icon
          title={intl.formatMessage(messages.upstreamLinkError)}
          aria-label={intl.formatMessage(messages.upstreamLinkError)}
          src={LinkOff}
          size={size}
        />
      )}
    </div>
  );
};
