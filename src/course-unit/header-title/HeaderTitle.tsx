import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge, Form, Icon, IconButton, Stack, useToggle,
} from '@openedx/paragon';
import {
  EditOutline as EditIcon,
  Groups,
  Lock,
  QuestionAnswer,
  Settings as SettingsIcon,
} from '@openedx/paragon/icons';

import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { getCourseUnitData } from '../data/selectors';
import { updateQueryPendingStatus } from '../data/slice';
import messages from './messages';
import { UNIT_VISIBILITY_STATES } from '../constants';

const StatusBar = ({ courseUnit }: { courseUnit: any }) => {
  const { selectedPartitionIndex, selectedGroupsLabel } = courseUnit.userPartitionInfo ?? {};
  const hasGroups = selectedPartitionIndex !== -1 && !Number.isNaN(selectedPartitionIndex) && selectedGroupsLabel;

  let visibilityChipData = {
    variant: 'success',
    className: 'bg-white text-success-400 border border-success-500',
    text: messages.statusBarUpcomingBadge,
  };
  let publishStatusChipData = {
    variant: 'light',
    className: '',
    text: messages.statusBarUnpublishedBadge,
  };

  if (courseUnit.currentlyVisibleToStudents) {
    visibilityChipData = {
      variant: 'success',
      className: '',
      text: messages.statusBarLiveBadge,
    };
  } else if (courseUnit.visibilityState === UNIT_VISIBILITY_STATES.ready) {
    visibilityChipData = {
      variant: 'success',
      className: 'bg-white text-success-400 border border-success-500',
      text: messages.statusBarReadyBadge,
    };
  }

  if (courseUnit.published) {
    if (courseUnit.hasChanges) {
      publishStatusChipData = {
        variant: 'warning',
        className: 'bg-warning-500 text-primary-700 border border-warning-300',
        text: messages.statusBarDraftChangesBadge,
      };
    } else {
      publishStatusChipData = {
        variant: 'success',
        className: '',
        text: messages.statusBarPublishedBadge,
      };
    }
  }

  return (
    <Stack direction="horizontal" gap={3}>
      <Badge
        variant={visibilityChipData.variant}
        className={`px-3 py-2 ${visibilityChipData.className}`}
      >
        <FormattedMessage {...visibilityChipData.text} />
      </Badge>
      <Badge
        variant={publishStatusChipData.variant}
        className={`px-3 py-2 ${publishStatusChipData.className}`}
      >
        <FormattedMessage {...publishStatusChipData.text} />
      </Badge>
      {courseUnit.visibilityState === UNIT_VISIBILITY_STATES.staffOnly && (
        <Stack direction="horizontal" gap={1}>
          <Icon src={Lock} />
          <FormattedMessage {...messages.statusBarStaffOnly} />
        </Stack>
      )}
      {hasGroups && (
        <Stack direction="horizontal" gap={1}>
          <Icon src={Groups} />
          <span>
            {selectedGroupsLabel}
          </span>
        </Stack>
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
      <div className="d-flex align-items-center lead" data-testid="unit-header-title">
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
          className="ml-1 flex-shrink-0"
          iconAs={EditIcon}
          onClick={handleTitleEdit}
        />
        <IconButton
          alt={intl.formatMessage(messages.altButtonSettings)}
          className="flex-shrink-0"
          iconAs={SettingsIcon}
          onClick={openConfigureModal}
        />
        <ConfigureModal
          isOpen={isConfigureModalOpen}
          onClose={closeConfigureModal}
          onConfigureSubmit={onConfigureSubmit}
          currentItemData={currentItemData}
          isSelfPaced={false}
          isXBlockComponent={isXBlockComponent}
        />
      </div>
      <div className="h5 mt-2 font-weight-normal">
        <StatusBar courseUnit={currentItemData} />
      </div>
    </>
  );
};

export default HeaderTitle;
