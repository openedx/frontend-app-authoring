import { Button, useToggle } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Add as AddIcon } from '@openedx/paragon/icons';

import { AvailableGroup, GroupActions } from '@src/group-configurations/types';
import { useScrollToHashElement } from '@src/hooks';
import EmptyPlaceholder from '../empty-placeholder';
import ExperimentForm from './ExperimentForm';
import ExperimentCard from './ExperimentCard';
import { initialExperimentConfiguration } from './constants';
import messages from './messages';

interface ExperimentConfigurationsSectionProps {
  availableGroups?: AvailableGroup[];
  experimentConfigurationActions: GroupActions;
  readOnly?: boolean;
}

const ExperimentConfigurationsSection = ({
  availableGroups = [],
  experimentConfigurationActions,
  readOnly = false,
}: ExperimentConfigurationsSectionProps) => {
  const [
    isNewConfigurationVisible,
    openNewConfiguration,
    hideNewConfiguration,
  ] = useToggle(false);

  const handleCreateConfiguration = (configuration: AvailableGroup) => {
    experimentConfigurationActions.handleCreate(configuration, hideNewConfiguration);
  };

  const { elementWithHash } = useScrollToHashElement({ isLoading: true });

  return (
    <div className="mt-2.5">
      <h2 className="lead text-black mb-3 configuration-section-name">
        <FormattedMessage {...messages.title} />
      </h2>
      {availableGroups.length ?
        (
          <>
            {availableGroups.map((configuration) => (
              <ExperimentCard
                key={configuration.id}
                configuration={configuration}
                experimentConfigurationActions={experimentConfigurationActions}
                isExpandedByDefault={configuration.id === Number(elementWithHash)}
                onCreate={handleCreateConfiguration}
                readOnly={readOnly}
              />
            ))}
            {!readOnly && !isNewConfigurationVisible && (
              <Button
                className="mt-4"
                variant="outline-primary"
                onClick={openNewConfiguration}
                iconBefore={AddIcon}
                block
              >
                <FormattedMessage {...messages.addNewGroup} />
              </Button>
            )}
          </>
        ) :
        (
          !isNewConfigurationVisible && (
            <EmptyPlaceholder
              onCreateNewGroup={openNewConfiguration}
              isExperiment
              readOnly={readOnly}
            />
          )
        )}
      {isNewConfigurationVisible && (
        <ExperimentForm
          initialValues={initialExperimentConfiguration}
          onCreateClick={handleCreateConfiguration}
          onCancelClick={hideNewConfiguration}
        />
      )}
    </div>
  );
};

export default ExperimentConfigurationsSection;
