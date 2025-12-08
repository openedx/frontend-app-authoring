/* eslint-disable react/prop-types */
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import {
  CallSplit, LinkOff, Newsstand, Sync,
} from '@openedx/paragon/icons';

import messages from './messages';

export interface UpstreamInfoIconProps {
  upstreamInfo?: {
    errorMessage?: string | null;
    upstreamRef?: string | null;
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

  let hasTwoIcons = false;
  const hasCourseOverrides = (upstreamInfo?.downstreamCustomized.length || 0) > 0;
  if (upstreamInfo?.errorMessage || upstreamInfo?.readyToSync || hasCourseOverrides) {
    hasTwoIcons = true;
  }

  const getSecondIconProps = () => {
    if (upstreamInfo?.errorMessage) {
      return {
        title: intl.formatMessage(messages.upstreamLinkError),
        ariaLabel: intl.formatMessage(messages.upstreamLinkError),
        src: LinkOff,
      };
    } if (upstreamInfo?.readyToSync) {
      return {
        title: intl.formatMessage(messages.upstreamLinkReadyToSyncAriaLabel),
        ariaLabel: intl.formatMessage(messages.upstreamLinkReadyToSyncAriaLabel),
        src: Sync,
      };
    } if (hasCourseOverrides) {
      return {
        title: intl.formatMessage(messages.upstreamLinkOverridesAriaLabel),
        ariaLabel: intl.formatMessage(messages.upstreamLinkOverridesAriaLabel),
        src: CallSplit,
      };
    }
    return {};
  };

  return (
    <div
      className={
        `upstream-info-icon size-${hasTwoIcons ? 'two' : 'one'}-${size} box-shadow-centered-1 d-flex justify-content-center`
      }
    >
      <Icon
        title={intl.formatMessage(messages.upstreamLinkOk)}
        aria-label={intl.formatMessage(messages.upstreamLinkOk)}
        src={Newsstand}
        size={size}
      />
      {hasTwoIcons && (
        <Icon
          size={size}
          {...getSecondIconProps()}
        />
      )}
    </div>
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
        size="inline"
        className="px-0"
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
