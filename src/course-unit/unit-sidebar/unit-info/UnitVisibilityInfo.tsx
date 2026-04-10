import { useSelector } from 'react-redux';
import {
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { Edit, Groups, Lock } from '@openedx/paragon/icons';
import messages from './messages';
import { useUnitSidebarContext } from '../UnitSidebarContext';

interface UnitVisibilityInfoProps {
  visibleToStaffOnly: boolean;
  userPartitionInfo?: {
    selectablePartitions: Record<string, any>[];
    selectedGroupsLabel: string;
    selectedPartitionIndex: number;
  };
}

interface UnitVisibilityInfoContentProps {
  visibleToStaffOnly: boolean;
  userPartitionInfo?: {
    selectablePartitions: Record<string, any>[];
    selectedGroupsLabel: string;
    selectedPartitionIndex: number;
  };
}

const UnitVisibilityInfoContent = ({
  visibleToStaffOnly,
  userPartitionInfo,
}: UnitVisibilityInfoContentProps) => {
  const intl = useIntl();
  const { setCurrentTabKey } = useUnitSidebarContext();

  const { selectedPartitionIndex, selectedGroupsLabel } = userPartitionInfo ?? {};
  const hasGroups = selectedPartitionIndex !== -1 && !Number.isNaN(selectedPartitionIndex) && selectedGroupsLabel;
  let groupsCount = 0;
  if (hasGroups) {
    groupsCount = selectedGroupsLabel.split(',').length;
  }

  let labelMessages = intl.formatMessage(messages.visibilityAllLearnersTitle);
  let secondLabelMessages;

  if (visibleToStaffOnly) {
    labelMessages = intl.formatMessage(messages.visibilityStaffOnlyTitle);
  } else if (hasGroups) {
    if (groupsCount === 1) {
      labelMessages = selectedGroupsLabel;
      secondLabelMessages = intl.formatMessage(
        messages.visibilitySingleGroupDetails,
        {
          groupName: selectedGroupsLabel,
        },
      );
    } else {
      labelMessages = intl.formatMessage(messages.visibilityAccessRestrictionsTitle);
      secondLabelMessages = intl.formatMessage(messages.visibilityMultipleGroupsDetails);
    }
  }

  return (
    <>
      <Stack direction="horizontal" gap={2}>
        {visibleToStaffOnly ? <Icon src={Lock} /> : <Icon src={Groups} />}
        <span className="font-weight-bold text-primary-700">
          {labelMessages}
        </span>
        <IconButton
          src={Edit}
          alt={intl.formatMessage(messages.visibilityEditButton)}
          size="inline"
          onClick={() => setCurrentTabKey('settings')}
        />
      </Stack>
      {secondLabelMessages}
    </>
  );
};

const UnitVisibilityInfo = ({
  visibleToStaffOnly,
  userPartitionInfo,
}: UnitVisibilityInfoProps) => (
  <>
    <span className="heading-label">
      <FormattedMessage {...messages.visibilityVisibleToTitle} />
    </span>
    <UnitVisibilityInfoContent
      visibleToStaffOnly={visibleToStaffOnly}
      userPartitionInfo={userPartitionInfo}
    />
  </>
);

export default UnitVisibilityInfo;
