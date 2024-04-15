import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
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

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import TitleButton from '../common/TitleButton';
import UsageList from '../common/UsageList';
import ContentGroupForm from './ContentGroupForm';
import messages from './messages';

const ContentGroupCard = ({
  group,
  groupNames,
  parentGroupId,
  readOnly,
  contentGroupActions,
  handleEditGroup,
}) => {
  const { formatMessage } = useIntl();
  const { courseId } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, switchOnEditMode, switchOffEditMode] = useToggle(false);
  const [isOpenDeleteModal, openDeleteModal, closeDeleteModal] = useToggle(false);
  const { id, name, usage } = group;
  const isUsedInLocation = !!usage.length;

  const { href: outlineUrl } = new URL(
    `/course/${courseId}`,
    getConfig().STUDIO_BASE_URL,
  );

  const outlineComponentLink = (
    <Hyperlink destination={outlineUrl}>
      {formatMessage(messages.courseOutline)}
    </Hyperlink>
  );

  const guideHowToAdd = (
    <span
      className="small text-gray-700"
      data-testid="configuration-card-usage-empty"
    >
      {formatMessage(messages.emptyContentGroups, { outlineComponentLink })}
    </span>
  );

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleDeleteGroup = () => {
    contentGroupActions.handleDelete(parentGroupId, id);
    closeDeleteModal();
  };

  return (
    <>
      {isEditMode ? (
        <ContentGroupForm
          isEditMode={isEditMode}
          groupNames={groupNames}
          isUsedInLocation={isUsedInLocation}
          overrideValue={name}
          onCancelClick={switchOffEditMode}
          onEditClick={(values) => handleEditGroup(id, values, switchOffEditMode)}
        />
      ) : (
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
                  tooltipContent={formatMessage(messages.actionEdit)}
                  alt={formatMessage(messages.actionEdit)}
                  src={EditOutlineIcon}
                  iconAs={Icon}
                  onClick={switchOnEditMode}
                  data-testid="content-group-card-header-edit"
                />
                <IconButtonWithTooltip
                  className="configuration-card-header__delete-tooltip"
                  tooltipContent={formatMessage(
                    isUsedInLocation
                      ? messages.deleteRestriction
                      : messages.actionDelete,
                  )}
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
              {usage?.length ? (
                <UsageList
                  className="mt-2.5"
                  itemList={usage}
                  key={usage.label}
                />
              ) : (
                guideHowToAdd
              )}
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

ContentGroupCard.defaultProps = {
  group: {
    id: undefined,
    name: '',
    usage: [],
    version: undefined,
  },
  readOnly: false,
  groupNames: [],
  parentGroupId: null,
  handleEditGroup: null,
  contentGroupActions: {},
};

ContentGroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    usage: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        url: PropTypes.string,
      }),
    ),
    version: PropTypes.number.isRequired,
    active: PropTypes.bool,
    description: PropTypes.string,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        usage: PropTypes.arrayOf(
          PropTypes.shape({
            label: PropTypes.string,
            url: PropTypes.string,
          }),
        ),
        version: PropTypes.number,
      }),
    ),
    parameters: PropTypes.shape({
      courseId: PropTypes.string,
    }),
    readOnly: PropTypes.bool,
    scheme: PropTypes.string,
  }),
  groupNames: PropTypes.arrayOf(PropTypes.string),
  parentGroupId: PropTypes.number,
  readOnly: PropTypes.bool,
  handleEditGroup: PropTypes.func,
  contentGroupActions: PropTypes.shape({
    handleCreate: PropTypes.func,
    handleDelete: PropTypes.func,
    handleEdit: PropTypes.func,
  }),
};

export default ContentGroupCard;
