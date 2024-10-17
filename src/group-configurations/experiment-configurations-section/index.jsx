import PropTypes from 'prop-types';
import { Button, useToggle } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Add as AddIcon } from '@openedx/paragon/icons';

import { useScrollToHashElement } from '../../hooks';
import EmptyPlaceholder from '../empty-placeholder';
import ExperimentForm from './ExperimentForm';
import ExperimentCard from './ExperimentCard';
import { initialExperimentConfiguration } from './constants';
import messages from './messages';

const ExperimentConfigurationsSection = ({
  courseId,
  availableGroups,
  experimentConfigurationActions,
}) => {
  const { formatMessage } = useIntl();
  const [
    isNewConfigurationVisible,
    openNewConfiguration,
    hideNewConfiguration,
  ] = useToggle(false);

  const handleCreateConfiguration = (configuration) => {
    experimentConfigurationActions.handleCreate(configuration, hideNewConfiguration);
  };

  const { elementWithHash } = useScrollToHashElement({ courseId, isLoading: true });

  return (
    <div className="mt-2.5">
      <h2 className="lead text-black mb-3 configuration-section-name">
        {formatMessage(messages.title)}
      </h2>
      {availableGroups.length ? (
        <>
          {availableGroups.map((configuration) => (
            <ExperimentCard
              key={configuration.id}
              configuration={configuration}
              experimentConfigurationActions={experimentConfigurationActions}
              isExpandedByDefault={configuration.id === +elementWithHash}
              onCreate={handleCreateConfiguration}
            />
          ))}
          {!isNewConfigurationVisible && (
            <Button
              className="mt-4"
              variant="outline-primary"
              onClick={openNewConfiguration}
              iconBefore={AddIcon}
              block
            >
              {formatMessage(messages.addNewGroup)}
            </Button>
          )}
        </>
      ) : (
        !isNewConfigurationVisible && (
          <EmptyPlaceholder
            onCreateNewGroup={openNewConfiguration}
            isExperiment
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

ExperimentConfigurationsSection.defaultProps = {
  availableGroups: [],
};

ExperimentConfigurationsSection.propTypes = {
  availableGroups: PropTypes.arrayOf(
    PropTypes.shape({
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
        }).isRequired,
      ),
      id: PropTypes.number,
      name: PropTypes.string,
      parameters: PropTypes.shape({
        courseId: PropTypes.string,
      }),
      readOnly: PropTypes.bool,
      scheme: PropTypes.string,
      version: PropTypes.number,
    }).isRequired,
  ),
  experimentConfigurationActions: PropTypes.shape({
    handleCreate: PropTypes.func,
    handleDelete: PropTypes.func,
  }).isRequired,
  courseId: PropTypes.string.isRequired,
};

export default ExperimentConfigurationsSection;
