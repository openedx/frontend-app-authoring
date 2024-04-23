import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';

import { availableGroupPropTypes } from '../constants';
import EmptyPlaceholder from '../empty-placeholder';
import ContentGroupCard from './ContentGroupCard';
import ContentGroupForm from './ContentGroupForm';
import { initialContentGroupObject } from './utils';
import messages from './messages';

const ContentGroupsSection = ({
  availableGroup,
  contentGroupActions,
}) => {
  const { formatMessage } = useIntl();
  const [isNewGroupVisible, openNewGroup, hideNewGroup] = useToggle(false);
  const { id: parentGroupId, groups, name } = availableGroup;
  const groupNames = groups?.map((group) => group.name);

  const handleCreateNewGroup = (values) => {
    const updatedContentGroups = {
      ...availableGroup,
      groups: [
        ...availableGroup.groups,
        initialContentGroupObject(values.newGroupName),
      ],
    };
    contentGroupActions.handleCreate(updatedContentGroups, hideNewGroup);
  };

  const handleEditContentGroup = (id, { newGroupName }, callbackToClose) => {
    const updatedContentGroups = {
      ...availableGroup,
      groups: availableGroup.groups.map((group) => (group.id === id ? { ...group, name: newGroupName } : group)),
    };
    contentGroupActions.handleEdit(updatedContentGroups, callbackToClose);
  };

  return (
    <div className="mt-2.5">
      <h2 className="lead text-black mb-3 configuration-section-name">
        {name}
      </h2>
      {groups?.length ? (
        <>
          {groups.map((group) => (
            <ContentGroupCard
              group={group}
              groupNames={groupNames}
              parentGroupId={parentGroupId}
              key={group.id}
              contentGroupActions={contentGroupActions}
              handleEditGroup={handleEditContentGroup}
            />
          ))}
          {!isNewGroupVisible && (
            <Button
              className="mt-4"
              variant="outline-primary"
              onClick={openNewGroup}
              iconBefore={AddIcon}
              block
            >
              {formatMessage(messages.addNewGroup)}
            </Button>
          )}
        </>
      ) : (
        !isNewGroupVisible && (
          <EmptyPlaceholder onCreateNewGroup={openNewGroup} />
        )
      )}
      {isNewGroupVisible && (
        <ContentGroupForm
          groupNames={groupNames}
          onCreateClick={handleCreateNewGroup}
          onCancelClick={hideNewGroup}
        />
      )}
    </div>
  );
};

ContentGroupsSection.propTypes = {
  availableGroup: PropTypes.shape(availableGroupPropTypes).isRequired,
  contentGroupActions: PropTypes.shape({
    handleCreate: PropTypes.func,
    handleDelete: PropTypes.func,
    handleEdit: PropTypes.func,
  }).isRequired,
};

export default ContentGroupsSection;
