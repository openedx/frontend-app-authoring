import PropTypes from 'prop-types';

export const DUPLICATE_ASSIGNMENT_NAME = 'duplicateAssignmentName';

export const ASSIGNMENT_TYPES = {
  type: 'type',
  weight: 'weight',
  minCount: 'minCount',
  dropCount: 'dropCount',
};

export const defaultAssignmentsPropTypes = {
  type: PropTypes.string,
  minCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dropCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  shortLabel: PropTypes.string,
  weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
