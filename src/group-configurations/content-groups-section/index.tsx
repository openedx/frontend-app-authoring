import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';

import { AvailableGroup, ContentGroupFormValues, GroupActions } from '@src/group-configurations/types';
import EmptyPlaceholder from '../empty-placeholder';
import ContentGroupCard from './ContentGroupCard';
import ContentGroupForm from './ContentGroupForm';
import { initialContentGroupObject } from './utils';
import messages from './messages';

interface ContentGroupsSectionProps {
  availableGroup: AvailableGroup;
  contentGroupActions: GroupActions;
  readOnly?: boolean;
}

const ContentGroupsSection = ({
  availableGroup,
  contentGroupActions,
  readOnly = false,
}: ContentGroupsSectionProps) => {
  const [isNewGroupVisible, openNewGroup, hideNewGroup] = useToggle(false);
  const { id: parentGroupId, groups, name } = availableGroup;
  const groupNames = groups?.map((group) => group.name);

  const handleCreateNewGroup = (values: ContentGroupFormValues) => {
    const updatedContentGroups = {
      ...availableGroup,
      groups: [
        ...availableGroup.groups,
        initialContentGroupObject(values.newGroupName),
      ],
    };
    contentGroupActions.handleCreate(updatedContentGroups, hideNewGroup);
  };

  const handleEditContentGroup = (
    id: number,
    { newGroupName }: ContentGroupFormValues,
    callbackToClose: () => void,
  ) => {
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
      {groups?.length ?
        (
          <>
            {groups.map((group) => (
              <ContentGroupCard
                group={group}
                groupNames={groupNames}
                parentGroupId={parentGroupId}
                key={group.id}
                readOnly={readOnly}
                contentGroupActions={contentGroupActions}
                handleEditGroup={handleEditContentGroup}
              />
            ))}
            {!readOnly && !isNewGroupVisible && (
              <Button
                className="mt-4"
                variant="outline-primary"
                onClick={openNewGroup}
                iconBefore={AddIcon}
                block
              >
                <FormattedMessage {...messages.addNewGroup} />
              </Button>
            )}
          </>
        ) :
        (
          !isNewGroupVisible && <EmptyPlaceholder onCreateNewGroup={openNewGroup} readOnly={readOnly} />
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

export default ContentGroupsSection;
