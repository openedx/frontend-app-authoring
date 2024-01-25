import PropTypes from 'prop-types';

import GroupConfigurationContainer from '../group-configuration-container';

const EnrollmentTrackGroupsSection = ({ availableGroup: { groups, name } }) => (
  <div className="mt-2.5">
    <h2 className="lead text-black mb-3 configuration-section-name">{name}</h2>
    {groups.map((group) => (
      <GroupConfigurationContainer
        group={group}
        key={group.id}
        readOnly
      />
    ))}
  </div>
);

EnrollmentTrackGroupsSection.propTypes = {
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

export default EnrollmentTrackGroupsSection;
