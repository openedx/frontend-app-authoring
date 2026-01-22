import { useDispatch, useSelector } from 'react-redux';
import {
  Form, Icon, IconButton, Stack,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';

import { getCourseUnitData } from '@src/course-unit/data/selectors';
import { editCourseUnitVisibilityAndData } from '@src/course-unit/data/thunk';
import { PUBLISH_TYPES } from '@src/course-unit/constants';
import { isUnitPageNewDesignEnabled } from '@src/course-unit/utils';
import { Edit, Groups, Lock } from '@openedx/paragon/icons';
import messages from './messages';
import { useUnitSidebarContext } from '../UnitSidebarContext';

interface UnitVisibilityInfoProps {
  openVisibleModal: () => void,
  visibleToStaffOnly: boolean,
  userPartitionInfo?: {
    selectablePartitions: Record<string, any>[],
    selectedGroupsLabel: string,
    selectedPartitionIndex: number,
  },
}

interface UnitvisibilityInfoContentProps {
  visibleToStaffOnly: boolean,
  userPartitionInfo?: {
    selectablePartitions: Record<string, any>[],
    selectedGroupsLabel: string,
    selectedPartitionIndex: number,
  },
}

const LegacyVisibilityInfo = ({
  visibleToStaffOnly,
  openVisibleModal,
}: UnitVisibilityInfoProps) => {
  const {
    staffLockFrom,
    hasExplicitStaffLock,
  } = useSelector(getCourseUnitData);

  const { blockId } = useParams();
  const dispatch = useDispatch();

  const handleCourseUnitVisibility = () => {
    /* istanbul ignore next */
    dispatch(editCourseUnitVisibilityAndData(blockId, PUBLISH_TYPES.republish, true));
  };

  return (
    <>
      {visibleToStaffOnly ? (
        <>
          <h6 className="course-unit-sidebar-visibility-copy">
            <FormattedMessage {...messages.visibilityStaffOnlyTitle} />
          </h6>
          {/* istanbul ignore next */ !hasExplicitStaffLock && (
            <span className="course-unit-sidebar-visibility-section mb-2">
              <FormattedMessage
                {...messages.visibilityHasExplicitStaffLockText}
                values={{ sectionName: staffLockFrom }}
              />
            </span>
          )}
        </>
      ) : (
        <h6 className="course-unit-sidebar-visibility-copy">
          <FormattedMessage {...messages.visibilityStaffAndLearnersTitle} />
        </h6>
      )}
      <Form.Checkbox
        className="course-unit-sidebar-visibility-checkbox"
        checked={hasExplicitStaffLock}
        onChange={hasExplicitStaffLock ? null : handleCourseUnitVisibility}
        onClick={hasExplicitStaffLock ? openVisibleModal : null}
      >
        <FormattedMessage {...messages.visibilityCheckboxTitle} />
      </Form.Checkbox>
    </>
  );
};

const UnitvisibilityInfoContent = ({
  visibleToStaffOnly,
  userPartitionInfo,
}: UnitvisibilityInfoContentProps) => {
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
        {visibleToStaffOnly ? (
          <Icon src={Lock} />
        ) : (
          <Icon src={Groups} />
        )}
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
  openVisibleModal,
  visibleToStaffOnly,
  userPartitionInfo,
}: UnitVisibilityInfoProps) => (
  <>
    <small className="course-unit-sidebar-visibility-title">
      <FormattedMessage {...messages.visibilityVisibleToTitle} />
    </small>
    {isUnitPageNewDesignEnabled() ? (
      <UnitvisibilityInfoContent
        visibleToStaffOnly={visibleToStaffOnly}
        userPartitionInfo={userPartitionInfo}
      />
    ) : (
      <LegacyVisibilityInfo
        visibleToStaffOnly={visibleToStaffOnly}
        openVisibleModal={openVisibleModal}
      />
    )}
  </>
);

export default UnitVisibilityInfo;
