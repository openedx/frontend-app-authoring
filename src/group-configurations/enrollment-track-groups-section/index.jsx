import PropTypes from 'prop-types';

import { availableGroupPropTypes } from '../constants';
import ContentGroupCard from '../content-groups-section/ContentGroupCard';

const EnrollmentTrackGroupsSection = ({ availableGroup: { groups, name } }) => (
  <div className="mt-2.5">
    <h2 className="lead text-black mb-3 configuration-section-name">{name}</h2>
    {groups.map((group) => (
      <ContentGroupCard
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
