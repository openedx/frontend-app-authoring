import React from 'react';
import {
  Chip,
} from '@openedx/paragon';
import { Tag, Close } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import TagOutlineIcon from './TagOutlineIcon';

const TagBubble = ({
  value, implicit, level, lineage, removeTagHandler, canRemove,
}) => {
  const className = `tag-bubble mb-2 border-light-300 ${implicit ? 'implicit' : ''}`;

  const handleClick = React.useCallback(() => {
    if (!implicit && canRemove) {
      removeTagHandler(lineage.join(','), false);
    }
  }, [implicit, lineage, canRemove, removeTagHandler]);

  return (
    <div style={{ paddingLeft: `${level * 1}rem` }}>
      <Chip
        className={className}
        variant="light"
        iconBefore={!implicit ? Tag : TagOutlineIcon}
        iconAfter={!implicit && canRemove ? Close : null}
        onIconAfterClick={handleClick}
      >
        {value}
      </Chip>
    </div>
  );
};

TagBubble.defaultProps = {
  implicit: true,
  level: 0,
  canRemove: false,
};

TagBubble.propTypes = {
  value: PropTypes.string.isRequired,
  implicit: PropTypes.bool,
  level: PropTypes.number,
  lineage: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeTagHandler: PropTypes.func.isRequired,
  canRemove: PropTypes.bool,
};

export default TagBubble;
