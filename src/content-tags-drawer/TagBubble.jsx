import React from 'react';
import {
  Button,
} from '@edx/paragon';
import { Tag, Close } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import TagOutlineIcon from './TagOutlineIcon';

const TagBubble = ({
  value, subTagsCount, implicit, level,
}) => {
  const className = `tag-bubble mb-2 ${implicit ? 'implicit' : ''}`;
  const tagIcon = () => (implicit ? <TagOutlineIcon className="implicit-tag-icon" /> : <Tag />);
  return (
    <div style={{ paddingLeft: `${level * 1}rem` }}>
      <Button
        className={className}
        variant="outline-dark"
        iconBefore={tagIcon}
        iconAfter={!implicit ? Close : null}
      >
        {value} {subTagsCount > 0 ? `(${subTagsCount})` : null }
      </Button>
    </div>
  );
};

TagBubble.defaultProps = {
  subTagsCount: 0,
  implicit: true,
  level: 0,
};

TagBubble.propTypes = {
  value: PropTypes.string.isRequired,
  subTagsCount: PropTypes.number,
  implicit: PropTypes.bool,
  level: PropTypes.number,
};

export default TagBubble;
