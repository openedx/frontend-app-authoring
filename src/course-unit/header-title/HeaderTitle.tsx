import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MessageDescriptor } from 'react-intl';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge, Form, Icon, IconButton, OverlayTrigger, Stack, Tooltip, useToggle,
} from '@openedx/paragon';
import {
  EditOutline as EditIcon,
  Groups,
  QuestionAnswer,
  Settings as SettingsIcon,
} from '@openedx/paragon/icons';

import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { getCourseUnitData } from '../data/selectors';
import { updateQueryPendingStatus } from '../data/slice';
import messages from './messages';
import { UNIT_VISIBILITY_STATES } from '../constants';
import { isUnitPageNewDesignEnabled } from '../utils';

const StatusBar = ({ courseUnit }: { courseUnit: any }) => {
  const { selectedPartitionIndex, selectedGroupsLabel } = courseUnit.userPartitionInfo ?? {};
  const hasGroups = selectedPartitionIndex !== -1 && !Number.isNaN(selectedPartitionIndex) && selectedGroupsLabel;
  let groupsCount = 0;
  if (hasGroups) {
    groupsCount = selectedGroupsLabel.split(",").length;
  }

  let visibilityChipData = {
    variant: 'warning',
    className: 'draft-badge',
    text: messages.statusBarDraftNeverPublished,
  } as {
    variant: string,
    className?: string,
    text: MessageDescriptor,
  };

  if (courseUnit.currentlyVisibleToStudents) {
    visibilityChipData = {
      variant: 'success',
      text: messages.statusBarLiveBadge,
    };
  } else if (courseUnit.visibilityState === UNIT_VISIBILITY_STATES.staffOnly) {
    visibilityChipData = {
      variant: 'secondary',
      text: messages.statusBarStaffOnly,
    };
  } else if (courseUnit.published) {
    visibilityChipData = {
      variant: 'info',
      text: messages.statusBarScheduledBadge,
    };
  }

  return (
    <Stack direction="horizontal" gap={3}>
      <Badge
        variant={visibilityChipData.variant}
        className={`px-3 py-2 ${visibilityChipData.className || ''}`}
      >
        <FormattedMessage {...visibilityChipData.text} />
      </Badge>
      {courseUnit.published && courseUnit.hasChanges && (
        <Badge
          variant='warning'
          className='px-3 py-2 draft-badge'
        >
          <FormattedMessage {...messages.statusBarDraftChangesBadge} />
        </Badge>
      )}
      {groupsCount === 1 && (
        <Stack direction="horizontal" gap={1}>
          <Icon src={Groups} />
          <span>
            <FormattedMessage
              {...messages.statusBarGroupAccessOneGroup}
              values={{
                groupName: selectedGroupsLabel
              }}
            />
          </span>
        </Stack>
      )}
      {groupsCount > 1 && (
        <OverlayTrigger
          placement='top'
          overlay={
            <Tooltip id='unit-group-access-tooltip'>
              {selectedGroupsLabel}
            </Tooltip>
          }
        >
          <Stack direction="horizontal" gap={1}>
            <Icon src={Groups} />
            <span>
              <FormattedMessage
                {...messages.statusBarGroupAccessMultipleGroup}
                values={{
                  groupsCount,
                }}
              />
            </span>
          </Stack>
        </OverlayTrigger>
      )}
      {courseUnit.discussionEnabled && (
        <Stack direction="horizontal" gap={1}>
          <Icon src={QuestionAnswer} />
          <FormattedMessage {...messages.statusBarDiscussionsEnabled} />
        </Stack>
      )}
    </Stack>
  );
};

type HeaderTitleProps = {
  unitTitle: string;
  isTitleEditFormOpen: boolean;
  handleTitleEdit: () => void;
  handleTitleEditSubmit: (title: string) => void;
  handleConfigureSubmit: (
    id: string,
    isVisible: boolean,
    groupAccess: boolean,
    isDiscussionEnabled: boolean,
    closeModalFn: (value: boolean) => void
  ) => void;
};

const HeaderTitle = ({
  unitTitle,
  isTitleEditFormOpen,
  handleTitleEdit,
  handleTitleEditSubmit,
  handleConfigureSubmit,
}: HeaderTitleProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [titleValue, setTitleValue] = useState(unitTitle);
  const currentItemData = useSelector(getCourseUnitData);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);

  const isXBlockComponent = [
    COURSE_BLOCK_NAMES.libraryContent.id,
    COURSE_BLOCK_NAMES.splitTest.id,
    COURSE_BLOCK_NAMES.component.id,
  ].includes(currentItemData.category);

  const onConfigureSubmit = (...arg) => {
    handleConfigureSubmit(
      currentItemData.id,
      arg[0],
      arg[1],
      arg[2],
      closeConfigureModal,
    );
  };

  useEffect(() => {
    setTitleValue(unitTitle);
    dispatch(updateQueryPendingStatus(true));
  }, [unitTitle]);

  return (
    <>
      <div className="unit-header-title d-flex align-items-center lead" data-testid="unit-header-title">
        {isTitleEditFormOpen ? (
          <Form.Group className="m-0">
            <Form.Control
              ref={(e) => e && e.focus()}
              value={titleValue}
              name="displayName"
              onChange={(e) => setTitleValue(e.target.value)}
              aria-label={intl.formatMessage(messages.ariaLabelButtonEdit)}
              onBlur={() => handleTitleEditSubmit(titleValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleEditSubmit(titleValue);
                }
              }}
            />
          </Form.Group>
        ) : unitTitle}
        <IconButton
          alt={intl.formatMessage(messages.altButtonEdit)}
          className="ml-1 flex-shrink-0 edit-button"
          iconAs={EditIcon}
          onClick={handleTitleEdit}
        />
        {!isUnitPageNewDesignEnabled() && (
          <IconButton
            alt={intl.formatMessage(messages.altButtonSettings)}
            className="flex-shrink-0"
            iconAs={SettingsIcon}
            onClick={openConfigureModal}
          />
        )}
        <ConfigureModal
          isOpen={isConfigureModalOpen}
          onClose={closeConfigureModal}
          onConfigureSubmit={onConfigureSubmit}
          currentItemData={currentItemData}
          isSelfPaced={false}
          isXBlockComponent={isXBlockComponent}
        />
      </div>
      {isUnitPageNewDesignEnabled() && (
        <div className="unit-header-status-bar h5 mt-2 font-weight-normal">
          <StatusBar courseUnit={currentItemData} />
        </div>
      )}
    </>
  );
};

export default HeaderTitle;
