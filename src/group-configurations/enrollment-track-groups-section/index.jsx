import PropTypes from 'prop-types';

import { availableGroupPropTypes } from '../constants';
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
  availableGroup: PropTypes.shape(availableGroupPropTypes).isRequired,
};

export default EnrollmentTrackGroupsSection;
