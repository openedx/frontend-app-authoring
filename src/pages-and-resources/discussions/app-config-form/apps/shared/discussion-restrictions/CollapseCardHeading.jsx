import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@openedx/paragon';

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
    <div style={{ height: 72 }}>
      {badgeStatus && <Badge variant={badgeVariant} style={{ padding: '2px 8px' }}>{badgeStatus}</Badge>}
      <div className="mt-2 font-size-14" style={{ lineHeight: '24px' }}>{collapseHeadingText}</div>
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

export default React.memo(CollapseCardHeading);
