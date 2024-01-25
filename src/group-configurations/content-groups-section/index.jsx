import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Add as AddIcon } from '@edx/paragon/icons';

import GroupConfigurationContainer from '../group-configuration-container';
import EmptyPlaceholder from '../empty-placeholder';
import messages from './messages';

const ContentGroupsSection = ({ availableGroup: { groups, name } }) => {
  const { formatMessage } = useIntl();
  return (
    <div className="mt-2.5">
      <h2 className="configuration-section-name lead text-black mb-3">{name}</h2>
      {groups?.length ? (
        <>
          {groups.map((group) => (
            <GroupConfigurationContainer group={group} key={group.id} />
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
        <EmptyPlaceholder onCreateNewGroup={() => ({})} />
      )}
    </div>
  );
};

ContentGroupsSection.propTypes = {
  availableGroup: PropTypes.shape({
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
    id: PropTypes.number,
    name: PropTypes.string,
    parameters: PropTypes.shape({
      courseId: PropTypes.string,
    }),
    readOnly: PropTypes.bool,
    scheme: PropTypes.string,
    version: PropTypes.number,
  }).isRequired,
};

export default ContentGroupsSection;
