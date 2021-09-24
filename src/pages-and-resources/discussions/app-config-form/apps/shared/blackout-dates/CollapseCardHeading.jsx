import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';

const CollapseCardHeading = ({
  isOpen,
  expandHeadingText,
  collapseHeadingText,
  badgeVariant,
  badgeStatus,
}) => {
  if (isOpen) {
    return <span className="h4 py-2 mr-auto">{expandHeadingText}</span>;
  }

  return (
    <div className="py-2">
      {badgeStatus && <Badge variant={badgeVariant}>{badgeStatus}</Badge>}
      <div>{collapseHeadingText}</div>
    </div>
  );
};

CollapseCardHeading.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  collapseHeadingText: PropTypes.string.isRequired,
  expandHeadingText: PropTypes.string.isRequired,
  badgeVariant: PropTypes.string,
  badgeStatus: PropTypes.string,
};

CollapseCardHeading.defaultProps = {
  badgeVariant: 'primary',
  badgeStatus: '',
};

export default CollapseCardHeading;
