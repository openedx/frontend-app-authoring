import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import {
  Lock as LockIcon,
  Groups as GroupsIcon,
} from '@openedx/paragon/icons';

import { UserPartitionInfoTypes, XBlockPrereqs } from '@src/data/types';
import messages from './messages';

interface StatusMessagesProps {
  isVertical: boolean;
  staffOnlyMessage?: boolean,
  prereq?: string,
  prereqs?: XBlockPrereqs[],
  userPartitionInfo?: UserPartitionInfoTypes,
  hasPartitionGroupComponents?: boolean,
}

interface StatusMessagesText {
  icon: React.ComponentType;
  text: string;
}

const StatusMessages = ({
  isVertical,
  staffOnlyMessage,
  prereq,
  prereqs,
  userPartitionInfo,
  hasPartitionGroupComponents,
}: StatusMessagesProps) => {
  const intl = useIntl();
  const statusMessages: StatusMessagesText[] = [];

  if (prereq) {
    let prereqDisplayName = '';
    prereqs?.forEach((block) => {
      if (block.blockUsageKey === prereq) {
        prereqDisplayName = block.blockDisplayName;
      }
    });
    statusMessages.push({
      icon: LockIcon,
      text: intl.formatMessage(messages.prerequisiteLabel, { prereqDisplayName }),
    });
  }

  if (!staffOnlyMessage && isVertical) {
    const { selectedPartitionIndex, selectedGroupsLabel } = userPartitionInfo || {};
    if (selectedPartitionIndex !== -1 && !Number.isNaN(selectedPartitionIndex)) {
      statusMessages.push({
        icon: GroupsIcon,
        text: intl.formatMessage(messages.restrictedUnitAccess, { selectedGroupsLabel }),
      });
    } else if (hasPartitionGroupComponents) {
      statusMessages.push({
        icon: GroupsIcon,
        text: intl.formatMessage(messages.restrictedUnitAccessToSomeContent),
      });
    }
  }

  if (statusMessages.length > 0) {
    return (
      <div className="border-top border-light mt-2 text-dark" data-testid="status-messages-div">
        {statusMessages.map(({ icon, text }) => (
          <div key={text} className="d-flex align-items-center pt-1">
            <Icon className="mr-1" size="sm" src={icon} />
            {text}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default StatusMessages;
