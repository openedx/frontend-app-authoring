/* eslint-disable react/prop-types */
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import {
  CallSplit, LinkOff, Newsstand, Sync,
} from '@openedx/paragon/icons';

import { BoldText } from '@src/utils';
import { ReactNode } from 'react';
import messages from './messages';

export interface UpstreamInfoIconProps {
  upstreamInfo?: {
    errorMessage?: string | null;
    upstreamRef?: string | null;
    upstreamName: string;
    readyToSync: boolean;
    downstreamCustomized: string[];
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'inline';
}

const UpstreamInfoIconContent = ({
  upstreamInfo,
  size,
}: UpstreamInfoIconProps) => {
  const intl = useIntl();

  if (!upstreamInfo) {
    return null;
  }

  let secondIcon: JSX.Element | undefined;
  let tooltipMessage: string | ReactNode = intl.formatMessage(
    messages.upstreamLinkTooltip,
    {
      upstreamName: upstreamInfo.upstreamName,
      b: BoldText,
    },
  );

  if (upstreamInfo.errorMessage) {
    tooltipMessage = intl.formatMessage(messages.upstreamLinkError);
    secondIcon = (
      <Icon
        size={size}
        title={intl.formatMessage(messages.upstreamLinkError)}
        aria-label={intl.formatMessage(messages.upstreamLinkError)}
        src={LinkOff}
      />
    );
  } else if (upstreamInfo.readyToSync) {
    tooltipMessage = intl.formatMessage(
      messages.upstreamLinkReadyToSyncTooltip,
      {
        upstreamName: upstreamInfo.upstreamName,
        b: BoldText,
      },
    );
    secondIcon = (
      <Icon
        size={size}
        title={intl.formatMessage(messages.upstreamLinkReadyToSyncAriaLabel)}
        aria-label={intl.formatMessage(messages.upstreamLinkReadyToSyncAriaLabel)}
        src={Sync}
      />
    );
  } else if ((upstreamInfo.downstreamCustomized.length || 0) > 0) {
    tooltipMessage = intl.formatMessage(messages.upstreamLinkOverridesAriaLabel);
    secondIcon = (
      <Icon
        size={size}
        title={intl.formatMessage(messages.upstreamLinkOverridesAriaLabel)}
        aria-label={intl.formatMessage(messages.upstreamLinkOverridesAriaLabel)}
        src={CallSplit}
      />
    );
  }

  return (
    <OverlayTrigger
      key={`upstream-icon-${upstreamInfo.upstreamRef}`}
      placement="top"
      overlay={(
        <Tooltip className="upstream-info-tooltip" id={`upstream-icon-tooltip-${upstreamInfo.upstreamRef}`}>
          {tooltipMessage}
        </Tooltip>
      )}
    >
      <div
        className={
          `upstream-info-icon size-${secondIcon ? 'two' : 'one'}-${size} ${upstreamInfo.readyToSync ? 'sync-state' : ''} rounded-sm d-flex justify-content-center`
        }
      >
        <Icon
          title={intl.formatMessage(messages.upstreamLinkOk)}
          aria-label={intl.formatMessage(messages.upstreamLinkOk)}
          src={Newsstand}
          size={size}
        />
        {secondIcon}
      </div>
    </OverlayTrigger>
  );
};

export const UpstreamInfoIcon: React.FC<UpstreamInfoIconProps & { openSyncModal: () => void }> = ({
  upstreamInfo,
  size,
  openSyncModal,
}) => {
  if (!upstreamInfo?.upstreamRef) {
    return null;
  }

  const handleSyncModal = (e) => {
    e.stopPropagation();
    openSyncModal();
  };

  if (upstreamInfo?.readyToSync) {
    return (
      <Button
        variant="tertiary"
        className="border-0 px-0 py-0"
        onClick={handleSyncModal}
      >
        <UpstreamInfoIconContent upstreamInfo={upstreamInfo} size={size} />
      </Button>
    );
  }

  return (
    <UpstreamInfoIconContent upstreamInfo={upstreamInfo} size={size} />
  );
};
