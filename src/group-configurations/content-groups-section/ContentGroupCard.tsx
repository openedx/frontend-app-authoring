import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Hyperlink,
  Icon,
  IconButtonWithTooltip,
  useToggle,
} from '@openedx/paragon';
import {
  DeleteOutline as DeleteOutlineIcon,
  EditOutline as EditOutlineIcon,
} from '@openedx/paragon/icons';

import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import { ContentGroupFormValues, Group, GroupActions } from '@src/group-configurations/types';
import TitleButton from '../common/TitleButton';
import UsageList from '../common/UsageList';
import ContentGroupForm from './ContentGroupForm';
import messages from './messages';

interface ContentGroupCardProps {
  group: Group;
  groupNames?: string[];
  parentGroupId?: number;
  readOnly?: boolean;
  contentGroupActions?: Partial<GroupActions>;
  handleEditGroup?: (
    id: number,
    values: ContentGroupFormValues,
    callbackToClose: () => void,
  ) => void;
}

const ContentGroupCard = ({
  group,
  groupNames = [],
  parentGroupId,
  readOnly = false,
  contentGroupActions = {},
  handleEditGroup,
}: ContentGroupCardProps) => {
  const { formatMessage } = useIntl();
  const { courseId } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, switchOnEditMode, switchOffEditMode] = useToggle(false);
  const [isOpenDeleteModal, openDeleteModal, closeDeleteModal] = useToggle(false);
  const { id, name, usage } = group;
  const isUsedInLocation = !!usage?.length;

  const { href: outlineUrl } = new URL(
    `/course/${courseId}`,
    getConfig().STUDIO_BASE_URL,
  );

  const outlineComponentLink = (
    <Hyperlink destination={outlineUrl}>
      <FormattedMessage {...messages.courseOutline} />
    </Hyperlink>
  );

  const guideHowToAdd = (
    <span
      className="small text-gray-700"
      data-testid="configuration-card-usage-empty"
    >
      <FormattedMessage {...messages.emptyContentGroups} values={{ outlineComponentLink }} />
    </span>
  );

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleDeleteGroup = () => {
    if (parentGroupId !== undefined) {
      contentGroupActions.handleDelete?.(parentGroupId, id);
    }
    closeDeleteModal();
  };

  return (
    <>
      {isEditMode ?
        (
          <ContentGroupForm
            isEditMode={isEditMode}
            groupNames={groupNames}
            isUsedInLocation={isUsedInLocation}
            overrideValue={name}
            onCancelClick={switchOffEditMode}
            onEditClick={(values: ContentGroupFormValues) => handleEditGroup?.(id, values, switchOffEditMode)}
          />
        ) :
        (
          <div className="configuration-card" data-testid="content-group-card">
            <div className="configuration-card-header">
              <TitleButton
                group={group}
                isExpanded={isExpanded}
                onTitleClick={handleExpandContent}
              />
              {!readOnly && (
                <ActionRow className="ml-auto d-flex">
                  <IconButtonWithTooltip
                    tooltipContent={<FormattedMessage {...messages.actionEdit} />}
                    alt={formatMessage(messages.actionEdit)}
                    src={EditOutlineIcon}
                    iconAs={Icon}
                    onClick={switchOnEditMode}
                    data-testid="content-group-card-header-edit"
                  />
                  <IconButtonWithTooltip
                    className="configuration-card-header__delete-tooltip"
                    tooltipContent={
                      <FormattedMessage
                        {...(isUsedInLocation
                          ? messages.deleteRestriction
                          : messages.actionDelete)}
                      />
                    }
                    alt={formatMessage(messages.actionDelete)}
                    src={DeleteOutlineIcon}
                    iconAs={Icon}
                    onClick={openDeleteModal}
                    data-testid="content-group-card-header-delete"
                    disabled={isUsedInLocation}
                  />
                </ActionRow>
              )}
            </div>
            {isExpanded && (
              <div
                className="configuration-card-content"
                data-testid="content-group-card-content"
              >
                {usage?.length ?
                  (
                    <UsageList
                      className="mt-2.5"
                      itemList={usage}
                    />
                  ) :
                  guideHowToAdd}
              </div>
            )}
          </div>
        )}
      <DeleteModal
        category={formatMessage(messages.subtitleModalDelete)}
        isOpen={isOpenDeleteModal}
        close={closeDeleteModal}
        onDeleteSubmit={handleDeleteGroup}
      />
    </>
  );
};

export default ContentGroupCard;
