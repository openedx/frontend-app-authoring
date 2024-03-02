import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import {
  Lock as LockIcon,
  Groups as GroupsIcon,
} from '@openedx/paragon/icons';

import messages from './messages';

const StatusMessages = ({
  isVertical,
  staffOnlyMessage,
  prereq,
  prereqs,
  userPartitionInfo,
  hasPartitionGroupComponents,
}) => {
  const intl = useIntl();
  const statusMessages = [];

  if (prereq) {
    let prereqDisplayName = '';
    prereqs.forEach((block) => {
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
    const { selectedPartitionIndex, selectedGroupsLabel } = userPartitionInfo;
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

StatusMessages.defaultProps = {
  staffOnlyMessage: false,
  prereq: '',
  prereqs: [],
  userPartitionInfo: {},
  hasPartitionGroupComponents: false,
};

StatusMessages.propTypes = {
  isVertical: PropTypes.bool.isRequired,
  staffOnlyMessage: PropTypes.bool,
  prereq: PropTypes.string,
  prereqs: PropTypes.arrayOf(PropTypes.shape({
    blockUsageKey: PropTypes.string.isRequired,
    blockDisplayName: PropTypes.string.isRequired,
  })),
  userPartitionInfo: PropTypes.shape({
    selectedPartitionIndex: PropTypes.number,
    selectedGroupsLabel: PropTypes.string,
  }),
  hasPartitionGroupComponents: PropTypes.bool,
};

export default StatusMessages;
