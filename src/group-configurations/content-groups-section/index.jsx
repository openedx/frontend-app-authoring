import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';

import GroupConfigurationContainer from '../group-configuration-container';
import { availableGroupPropTypes } from '../constants';
import ContentGroupContainer from './ContentGroupContainer';
import EmptyPlaceholder from '../empty-placeholder';
import { initialContentGroupObject } from './utils';
import messages from './messages';

const ContentGroupsSection = ({
  availableGroup,
  groupConfigurationsActions,
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
    groupConfigurationsActions.handleCreateContentGroup(updatedContentGroups, hideNewGroup);
  };

  const handleEditContentGroup = (id, { newGroupName }, callbackToClose) => {
    const updatedContentGroups = {
      ...availableGroup,
      groups: availableGroup.groups.map((group) => (group.id === id ? { ...group, name: newGroupName } : group)),
    };
    groupConfigurationsActions.handleEditContentGroup(updatedContentGroups, callbackToClose);
  };

  return (
    <div className="mt-2.5">
      <h2 className="lead text-black mb-3 configuration-section-name">
        {name}
      </h2>
      {groups?.length ? (
        <>
          {groups.map((group) => (
            <GroupConfigurationContainer
              group={group}
              groupNames={groupNames}
              parentGroupId={parentGroupId}
              key={group.id}
              groupConfigurationsActions={groupConfigurationsActions}
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
        <ContentGroupContainer
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
  groupConfigurationsActions: PropTypes.shape({
    handleCreateContentGroup: PropTypes.func,
    handleDeleteContentGroup: PropTypes.func,
    handleEditContentGroup: PropTypes.func,
  }).isRequired,
};

export default ContentGroupsSection;
