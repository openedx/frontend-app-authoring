import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Add as AddIcon } from '@edx/paragon/icons';

import GroupConfigurationContainer from '../group-configuration-container';
import EmptyPlaceholder from '../empty-placeholder';
import messages from './messages';

const ExperimentConfigurationsSection = ({ availableGroups }) => {
  const { formatMessage } = useIntl();

  return (
    <div className="mt-2.5">
      <p className="configuration-section-name lead text-black mb-3">{formatMessage(messages.title)}</p>
      {availableGroups.length ? (
        <>
          {availableGroups.map((group) => (
            <GroupConfigurationContainer
              key={group.id}
              group={group}
              isExperiment
            />
          ))}
          <Button
            className="mt-4"
            variant="outline-primary"
            onClick={() => ({})}
            iconBefore={AddIcon}
            block
          >
            {formatMessage(messages.addNewGroup)}
          </Button>
        </>
      ) : (
        <EmptyPlaceholder
          onCreateNewGroup={() => ({})}
          isExperiment
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
};

export default ExperimentConfigurationsSection;
